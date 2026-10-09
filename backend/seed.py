import json
from pathlib import Path

def defaults():
    shelters = [
        dict(id='S1', name='Government School', location='Shelter1', capacity=300, occupied=100, safe=True),
        dict(id='S2', name='Community Hall', location='Shelter2', capacity=400, occupied=100, safe=True),
        dict(id='S3', name='College Auditorium', location='Shelter3', capacity=500, occupied=200, safe=True)]
    edges = [('ZoneA','Junction1',2,1),('Junction1','Shelter1',3,1),
             ('ZoneA','Junction2',3,1),('Junction2','Shelter2',2,2),
             ('Junction2','Shelter3',4,1),('Shelter3','Shelter2',2,2)]
    roads = [dict(id=f'R{i+1}', source=a, destination=b, distance=d, risk=r, blocked=False)
             for i,(a,b,d,r) in enumerate(edges)]
    points = [('ZoneA','Zone A',12.91,74.84),('Junction1','North Junction',12.935,74.845),
              ('Junction2','East Junction',12.917,74.865),('Shelter1','Government School',12.954,74.853),
              ('Shelter2','Community Hall',12.937,74.885),('Shelter3','College Auditorium',12.906,74.895)]
    locations = [dict(id=i,name=n,lat=a,lng=b) for i,n,a,b in points]
    disaster = dict(id='DEMO',type='Flood',location='ZoneA',risk='HIGH',population=500,
                    description='Preloaded flood exercise near Zone A.')
    return dict(shelters=shelters,roads=roads,locations=locations,disasters=[disaster])

if __name__ == '__main__':
    folder = Path(__file__).parent / 'data'
    folder.mkdir(exist_ok=True)
    for name, value in defaults().items():
        (folder / f'{name}.json').write_text(json.dumps(value,indent=2),encoding='utf-8')

