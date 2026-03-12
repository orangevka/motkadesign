import json, sys
sys.stdout.reconfigure(encoding='utf-8')

def rgb_hex(c):
    return '#{:02X}{:02X}{:02X}'.format(int(c['r']*255), int(c['g']*255), int(c['b']*255))

def get_fill_color(node):
    for f in node.get('fills', []):
        if f.get('type') == 'SOLID' and f.get('visible', True) is not False:
            return rgb_hex(f['color'])
    return None

def walk(node, depth=0):
    indent = '  ' * depth
    t = node.get('type', '')
    name = node.get('name', '')

    if t in ('FRAME', 'GROUP', 'SECTION', 'COMPONENT', 'INSTANCE'):
        bb = node.get('absoluteBoundingBox') or {}
        w = int(bb.get('width', 0))
        h = int(bb.get('height', 0))
        print(f'{indent}[{t}] {name} ({w}x{h})')
        col = get_fill_color(node)
        if col:
            print(f'{indent}  bg: {col}')
        lm = node.get('layoutMode')
        if lm:
            gap = node.get('itemSpacing', 0)
            pt = node.get('paddingTop', 0)
            pr = node.get('paddingRight', 0)
            pb = node.get('paddingBottom', 0)
            pl = node.get('paddingLeft', 0)
            print(f'{indent}  layout: {lm} gap={gap} pad={pt},{pr},{pb},{pl}')
    elif t == 'TEXT':
        chars = node.get('characters', '')[:100].replace('\n', ' ')
        style = node.get('style', {})
        font = style.get('fontFamily', '')
        size = style.get('fontSize', '')
        weight = style.get('fontWeight', '')
        col = get_fill_color(node)
        print(f'{indent}[TEXT] "{chars}" | {font} {size}px w{weight} {col}')

    for child in node.get('children', []):
        walk(child, depth + 1)

with open('C:/tmp/figma_node.json', encoding='utf-8') as f:
    data = json.load(f)

for nid, ndata in data.get('nodes', {}).items():
    walk(ndata.get('document', {}))
