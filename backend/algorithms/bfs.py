from collections import deque


def reachable_shelters(start, roads, shelters):
    """Visit the undirected road graph in increasing hop count."""
    graph = {}
    for road in roads:
        if not road['blocked']:
            a, b = road['source'], road['destination']
            graph.setdefault(a, []).append(b)
            graph.setdefault(b, []).append(a)
    queue, visited, result = deque([start]), {start}, []
    while queue:
        node = queue.popleft()
        result.extend(s['id'] for s in shelters if s['location'] == node)
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return result
