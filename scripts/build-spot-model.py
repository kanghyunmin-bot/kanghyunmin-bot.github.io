import urllib.request, pathlib, xml.etree.ElementTree as ET, json, struct, concurrent.futures, hashlib
sha='4d038b3feae26ec82b46a4d586379114012a8ac7'
base=f'https://raw.githubusercontent.com/google-deepmind/mujoco_menagerie/{sha}/boston_dynamics_spot/'
out=pathlib.Path(__file__).resolve().parents[1]/'assets/models/spot'
out.mkdir(parents=True,exist_ok=True)
def get(n): return urllib.request.urlopen(base+n).read()
xml=get('spot.xml');out.joinpath('spot.xml').write_bytes(xml)
for n in ['LICENSE','README.md']:out.joinpath(n).write_bytes(get(n))
root=ET.fromstring(xml)
files=sorted({g.attrib['mesh']+'.obj' for g in root.findall('.//worldbody//geom') if g.get('class')=='visual'})
blob=bytearray();meshes={}
def parse(n):
 raw=get('assets/'+n);v=[];norm=[];indices=[];verts=[];lookup={}
 for line in raw.decode().splitlines():
  p=line.split()
  if not p:continue
  if p[0]=='v':v.append(tuple(map(float,p[1:4])))
  elif p[0]=='vn':norm.append(tuple(map(float,p[1:4])))
  elif p[0]=='f':
   face=[]
   for token in p[1:]:
    q=token.split('/');key=(int(q[0])-1,int(q[2])-1 if len(q)>2 and q[2] else -1)
    if key not in lookup:
     lookup[key]=len(verts)//6;verts.extend(v[key[0]]+(norm[key[1]] if key[1]>=0 else (0,0,1)))
    face.append(lookup[key])
   for i in range(1,len(face)-1):indices.extend((face[0],face[i],face[i+1]))
 return n,verts,indices,hashlib.sha256(raw).hexdigest()
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
 for n,v,i,h in ex.map(parse,files):
  offset=len(blob);blob.extend(struct.pack('<'+'f'*len(v),*v));io=len(blob);blob.extend(struct.pack('<'+'I'*len(i),*i))
  meshes[n[:-4]]={'offset':offset,'vertices':len(v)//6,'indexOffset':io,'indices':len(i),'sourceSHA256':h}
def body(e):
 return {'name':e.get('name'),'position':list(map(float,e.get('pos','0 0 0').split())), 'joint':e.find('joint').attrib if e.find('joint') is not None else None,'meshes':[{'mesh':g.get('mesh'),'material':g.get('material')} for g in e.findall('geom') if g.get('class')=='visual'],'children':[body(b) for b in e.findall('body')]}
data={'source':base,'commit':sha,'meshes':meshes,'body':body(root.find('worldbody/body'))}
out.joinpath('geometry.bin').write_bytes(blob);out.joinpath('model.json').write_text(json.dumps(data,separators=(',',':')))
print('Spot binary bytes:',len(blob),'meshes:',len(meshes))
