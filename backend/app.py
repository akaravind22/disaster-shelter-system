import json
import os
from pathlib import Path
from threading import RLock
from uuid import uuid4
from typing import Literal
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from backend.algorithms.bfs import reachable_shelters
from backend.algorithms.csp import allocate
from backend.algorithms.astar import astar
from backend.agent.knowledge_agent import decisions
from backend.seed import defaults

app = FastAPI(title='ShelterIQ · Academic Evacuation Simulator')
app.add_middleware(CORSMiddleware, allow_origins=['http://localhost:5173','http://127.0.0.1:5173'],
                   allow_methods=['*'], allow_headers=['*'])
DATA = Path(os.environ.get('SHELTER_DATA_DIR', Path(__file__).parent / 'data'))
lock = RLock()

def read(name):
    try:
        return json.loads((DATA / f'{name}.json').read_text(encoding='utf-8'))
    except (OSError, ValueError) as exc:
        raise HTTPException(503, f'{name}.json is unavailable or invalid. Restore the data file.') from exc

def write(name, value):
    try:
        DATA.mkdir(parents=True,exist_ok=True)
        target = DATA / f'{name}.json'
        temp = target.with_suffix('.tmp')
        temp.write_text(json.dumps(value,indent=2),encoding='utf-8')
        temp.replace(target)
    except OSError as exc:
        raise HTTPException(503, 'Unable to save simulation data.') from exc

class Disaster(BaseModel):
    type: Literal['Flood','Cyclone','Landslide','Earthquake','Fire','Other']
    location: str = Field(min_length=1)
    risk: Literal['LOW','MEDIUM','HIGH']
    population: int = Field(gt=0,le=1000000,strict=True)
    description: str = Field(min_length=1,max_length=1000)

class LocationQuery(BaseModel):
    location: str

class RouteQuery(LocationQuery):
    destination: str

def validate_location(location):
    if location not in {p['id'] for p in read('locations')}:
        raise HTTPException(422, 'Choose a valid disaster location.')

def plan():
    shelters, roads, locations, disasters = [read(n) for n in ('shelters','roads','locations','disasters')]
    if not disasters:
        raise HTTPException(409, 'Create a disaster before starting analysis.')
    disaster = disasters[-1]
    alerts = decisions(disaster,shelters,roads)
    reachable = reachable_shelters(disaster['location'],roads,shelters)
    allocations, unallocated = allocate(disaster['population'],shelters,reachable)
    routes = []
    for assignment in allocations:
        route = astar(disaster['location'],assignment['location'],roads,locations)
        if route is not None:
            routes.append(dict(**assignment,**route))
    alerts = decisions(disaster,shelters,roads,unallocated,reachable)
    for shelter in shelters:
        shelter['available'] = max(0,shelter['capacity']-shelter['occupied'])
        shelter['reachable'] = shelter['id'] in reachable
        shelter['status'] = 'UNSAFE' if not shelter['safe'] else 'FULL' if not shelter['available'] else 'SAFE'
    return dict(disaster=disaster,shelters=shelters,roads=roads,locations=locations,
                reachable=reachable,allocations=allocations,routes=routes,alerts=alerts,
                unallocated=unallocated,allocated=disaster['population']-unallocated,
                available_capacity=sum(s['available'] for s in shelters if s['safe'] and s['reachable']))

@app.get('/api/dashboard')
def dashboard():
    with lock:
        return plan()

@app.get('/api/shelters')
def shelters():
    return dashboard()['shelters']

@app.get('/api/roads')
def roads():
    with lock:
        return read('roads')

@app.get('/api/locations')
def locations():
    with lock:
        return read('locations')

@app.get('/api/disasters')
def disasters():
    with lock:
        return read('disasters')

@app.post('/api/disaster')
def new_disaster(value: Disaster):
    with lock:
        validate_location(value.location)
        if not value.description.strip():
            raise HTTPException(422, 'Enter a description.')
        disaster = dict(id=str(uuid4()),**value.model_dump())
        write('disasters',read('disasters')+[disaster])
        return plan()

@app.post('/api/evacuate')
@app.post('/api/allocate')
def evacuate():
    return dashboard()

@app.post('/api/find-shelters')
def find_shelters(value: LocationQuery):
    with lock:
        validate_location(value.location)
        return {'reachable':reachable_shelters(value.location,read('roads'),read('shelters'))}

@app.post('/api/find-route')
def find_route(value: RouteQuery):
    with lock:
        validate_location(value.location)
        validate_location(value.destination)
        route = astar(value.location,value.destination,read('roads'),read('locations'))
        if route is None:
            raise HTTPException(404,'No safe route is currently available. Update road conditions.')
        return route

@app.put('/api/roads/{item_id}/{action}')
def change_road(item_id: str, action: Literal['block','unblock']):
    with lock:
        items = read('roads')
        item = next((r for r in items if r['id']==item_id),None)
        if item is None:
            raise HTTPException(404,'Road not found.')
        previous = plan()['routes']
        item['blocked'] = action=='block'
        write('roads',items)
        result = plan()
        if previous != result['routes'] and result['routes']:
            result['alerts'].append(dict(code='ROUTE_UPDATED',level='success',message='Evacuation plan updated using available roads and shelters.'))
        return result

@app.put('/api/shelters/{item_id}/{action}')
def change_shelter(item_id: str, action: Literal['full','available','safe','unsafe']):
    with lock:
        items = read('shelters')
        item = next((s for s in items if s['id']==item_id),None)
        if item is None:
            raise HTTPException(404,'Shelter not found.')
        if action=='full':
            if item['occupied'] < item['capacity']:
                item['previous_occupied'] = item['occupied']
            item['occupied'] = item['capacity']
        elif action=='available':
            item['occupied'] = item.pop('previous_occupied',min(item['occupied'],item['capacity']-1))
        else:
            item['safe'] = action=='safe'
        write('shelters',items)
        return plan()

@app.put('/api/risk/{direction}')
def change_risk(direction: Literal['increase','decrease']):
    with lock:
        items = read('disasters')
        levels = ['LOW','MEDIUM','HIGH']
        i = levels.index(items[-1]['risk'])
        items[-1]['risk'] = levels[max(0,min(2,i+(1 if direction=='increase' else -1)))]
        write('disasters',items)
        return plan()

@app.post('/api/reset')
def reset():
    with lock:
        for name,value in defaults().items():
            write(name,value)
        return plan()

