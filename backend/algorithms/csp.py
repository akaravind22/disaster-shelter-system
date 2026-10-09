def allocate(population, shelters, reachable):
    """Integer CSP with capacity domains and a fixed total allocation.

    Forward checking bounds each variable by the capacity of remaining
    variables. Since people are interchangeable and domains are contiguous,
    the largest feasible value always has a completion (no backtracking needed).
    """
    candidates = [s for s in shelters if s['safe'] and s['id'] in reachable
                  and s['capacity'] > s['occupied']]
    capacities = [s['capacity'] - s['occupied'] for s in candidates]
    remaining = min(population, sum(capacities))
    target = remaining
    assignments = []
    for i, shelter in enumerate(candidates):
        lower = max(0, remaining - sum(capacities[i + 1:]))
        upper = min(capacities[i], remaining)
        assert lower <= upper
        if upper:
            assignments.append({'shelter_id': shelter['id'], 'name': shelter['name'],
                                'location': shelter['location'], 'people': upper})
        remaining -= upper
    return assignments, population - target
