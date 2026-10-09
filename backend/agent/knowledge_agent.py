def decisions(disaster, shelters, roads, unallocated=None, reachable=None):
    alerts = []
    def add(code, level, message):
        alerts.append({'code': code, 'level': level, 'message': message})
    risk = disaster['risk']
    add('RISK_' + risk, {'HIGH': 'danger', 'MEDIUM': 'warning', 'LOW': 'success'}[risk],
        {'HIGH': 'Immediate evacuation required.', 'MEDIUM': 'Prepare evacuation.',
         'LOW': 'Continue monitoring.'}[risk])
    for s in shelters:
        if not s['safe']:
            add('SHELTER_UNSAFE', 'danger', f"{s['name']} is unsafe and excluded.")
        if s['occupied'] >= s['capacity']:
            add('SHELTER_FULL', 'warning', f"{s['name']} is full. Select another shelter.")
    for r in roads:
        if r['blocked']:
            add('ROAD_BLOCKED', 'warning', f"Road {r['id']} is blocked. Recalculate using available roads.")
    if unallocated:
        add('CAPACITY_WARNING', 'danger', f'Insufficient reachable safe capacity. {unallocated} people remain unallocated.')
    if reachable is not None and not reachable:
        add('ROUTE_UNAVAILABLE', 'danger', 'No shelter is reachable. Update road conditions or disaster location.')
    return alerts
