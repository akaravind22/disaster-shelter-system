import json
import random
import tempfile
import unittest
from pathlib import Path
from fastapi.testclient import TestClient
from backend import app as module
from backend.seed import defaults
from backend.algorithms.astar import astar
from backend.algorithms.bfs import reachable_shelters
from backend.algorithms.csp import allocate

class SystemTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.original = module.DATA
        module.DATA = Path(self.temp.name)
        for name,value in defaults().items():
            module.write(name,value)
        self.client = TestClient(module.app)

    def tearDown(self):
        module.DATA = self.original
        self.temp.cleanup()

    def test_flood_demo_and_reroute(self):
        plan = self.client.get('/api/dashboard').json()
        self.assertEqual([(a['shelter_id'],a['people']) for a in plan['allocations']],[('S1',200),('S2',300)])
        self.assertEqual(plan['routes'][1]['road_ids'],['R3','R4'])
        changed = self.client.put('/api/roads/R4/block').json()
        self.assertEqual(changed['routes'][1]['road_ids'],['R3','R5','R6'])
        self.assertEqual(changed['routes'][1]['distance'],9)
        self.assertEqual(changed['routes'][1]['cost'],12)
        self.assertIn('ROUTE_UPDATED',[a['code'] for a in changed['alerts']])
        full = self.client.put('/api/shelters/S1/full').json()
        self.assertEqual([(a['shelter_id'],a['people']) for a in full['allocations']],[('S2',300),('S3',200)])
        self.assertEqual(full['unallocated'],0)
        # Repeated analysis must never consume capacity.
        self.assertEqual(self.client.post('/api/evacuate').json()['allocations'],full['allocations'])
        self.assertEqual(module.read('shelters')[1]['occupied'],100)

    def test_unreachable_and_shortage(self):
        self.client.put('/api/roads/R1/block')
        result = self.client.put('/api/roads/R3/block').json()
        self.assertEqual(result['reachable'],[])
        self.assertEqual(result['unallocated'],500)
        self.assertEqual(result['routes'],[])
        self.assertIn('ROUTE_UNAVAILABLE',[a['code'] for a in result['alerts']])

    def test_safety_full_restore_and_reset(self):
        self.client.put('/api/shelters/S1/full')
        self.client.put('/api/shelters/S1/full')
        result = self.client.put('/api/shelters/S1/available').json()
        self.assertEqual(result['shelters'][0]['occupied'],100)
        result = self.client.put('/api/shelters/S2/unsafe').json()
        self.assertNotIn('S2',[a['shelter_id'] for a in result['allocations']])
        result = self.client.put('/api/shelters/S1/unsafe').json()
        self.assertEqual(result['unallocated'],200)
        restored = self.client.post('/api/reset').json()
        self.assertEqual(restored['unallocated'],0)
        self.assertTrue(all(s['safe'] for s in restored['shelters']))

    def test_validation_and_errors(self):
        body = defaults()['disasters'][0]
        for patch in ({'population':0},{'population':1.5},{'population':True},{'population':1000001},
                      {'location':''},{'location':'unknown'},{'description':' '},{'risk':'EXTREME'}):
            self.assertEqual(self.client.post('/api/disaster',json={**body,**patch}).status_code,422)
        self.assertEqual(self.client.put('/api/roads/unknown/block').status_code,404)
        self.assertEqual(self.client.put('/api/shelters/unknown/full').status_code,404)
        self.assertEqual(self.client.put('/api/roads/R1/invalid').status_code,422)
        (module.DATA/'roads.json').unlink()
        self.assertEqual(self.client.get('/api/dashboard').status_code,503)

    def test_api_workflow(self):
        body = {**defaults()['disasters'][0],'type':'Fire','population':900}
        result = self.client.post('/api/disaster',json=body).json()
        self.assertEqual(result['unallocated'],100)
        for path in ('shelters','roads','disasters','locations'):
            self.assertEqual(self.client.get('/api/'+path).status_code,200)
        result = self.client.post('/api/find-shelters',json={'location':'ZoneA'}).json()
        self.assertEqual(set(result['reachable']),{'S1','S2','S3'})
        self.assertEqual(self.client.post('/api/allocate').status_code,200)
        result = self.client.post('/api/find-route',json={'location':'ZoneA','destination':'Shelter1'}).json()
        self.assertEqual(result['distance'],5)
        self.client.put('/api/roads/R2/block')
        self.assertEqual(self.client.post('/api/find-route',json={'location':'ZoneA','destination':'Shelter1'}).status_code,404)
        for _ in range(4):
            result = self.client.put('/api/risk/decrease').json()
        self.assertEqual(result['disaster']['risk'],'LOW')
        for _ in range(4):
            result = self.client.put('/api/risk/increase').json()
        self.assertEqual(result['disaster']['risk'],'HIGH')

    def test_astar_prefers_low_risk_over_short_distance(self):
        roads = [dict(id='short',source='A',destination='B',distance=1,risk=3,blocked=False),
                 dict(id='r2',source='A',destination='C',distance=2,risk=1,blocked=False),
                 dict(id='r3',source='C',destination='B',distance=2,risk=1,blocked=False)]
        points = [dict(id='A',lat=0,lng=0),dict(id='B',lat=0,lng=1),dict(id='C',lat=1,lng=0)]
        route = astar('A','B',roads,points)
        self.assertEqual(route['path'],['A','C','B'])
        self.assertEqual(route['cost'],4)
        self.assertEqual(astar('A','A',roads,points)['distance'],0)

    def test_csp_invariants_many_populations(self):
        sample = defaults()
        for population in [1,199,200,201,500,800,801,1000000]:
            for excluded in [[],['S1'],['S1','S2'],['S1','S2','S3']]:
                reachable = [s['id'] for s in sample['shelters'] if s['id'] not in excluded]
                assignments, remaining = allocate(population,sample['shelters'],reachable)
                capacity = sum(s['capacity']-s['occupied'] for s in sample['shelters'] if s['id'] in reachable)
                self.assertEqual(sum(a['people'] for a in assignments)+remaining,population)
                self.assertEqual(remaining,max(0,population-capacity))
                for assignment in assignments:
                    shelter = next(s for s in sample['shelters'] if s['id']==assignment['shelter_id'])
                    self.assertLessEqual(assignment['people'],shelter['capacity']-shelter['occupied'])

if __name__ == '__main__':
    unittest.main()

