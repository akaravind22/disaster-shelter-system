import heapq
import math


def astar(start, goal, roads, locations):
    """A* minimizes distance + risk penalty; excludes blocked roads.

    Scaled coordinate distance is a consistent lower bound even when demo
    coordinates and road distances differ. Missing coordinates use h=0.
    """
    points = {p['id']: (p['lat'], p['lng']) for p in locations}
    def straight(a, b):
        return math.dist(points[a], points[b]) if a in points and b in points else 0
    ratios = [r['distance'] / straight(r['source'], r['destination'])
              for r in roads if straight(r['source'], r['destination']) > 0]
    scale = min(ratios, default=0) if all(r[k] in points for r in roads for k in ('source', 'destination')) else 0
    graph = {}
    for r in roads:
        if not r['blocked']:
            graph.setdefault(r['source'], []).append((r['destination'], r))
            graph.setdefault(r['destination'], []).append((r['source'], r))
    queue = [(scale * straight(start, goal), 0, start, [start], [], 0)]
    best = {start: 0}
    while queue:
        _, cost, node, path, road_ids, distance = heapq.heappop(queue)
        if cost > best[node]:
            continue
        if node == goal:
            return {'path': path, 'road_ids': road_ids, 'distance': distance, 'cost': cost}
        for neighbor, road in graph.get(node, []):
            new_cost = cost + road['distance'] + {1: 0, 2: 3, 3: 10}[road['risk']]
            if new_cost < best.get(neighbor, math.inf):
                best[neighbor] = new_cost
                heapq.heappush(queue, (new_cost + scale * straight(neighbor, goal), new_cost,
                                      neighbor, path + [neighbor], road_ids + [road['id']],
                                      distance + road['distance']))
    return None
