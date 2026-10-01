import * as THREE from './vendor/three.module.js';

// Public Spot mesh model plus an original mobile-manipulator concept.
// Motion is an artistic joint animation, not a deployed robot policy.
const root = document.getElementById('robot-world');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const mobile = matchMedia('(max-width: 720px)');
const motionButton = document.getElementById('motion-toggle');
let running = !reducedMotion.matches;
let render;
try {
  const renderer = new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
  render = renderer;
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile.matches ? 1.35 : 1.7));
  renderer.setSize(innerWidth,innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  root.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x071627,0.045);
  const camera = new THREE.PerspectiveCamera(36,innerWidth/innerHeight,0.1,80);
  camera.position.set(6.7,4.6,9.5);
  const environmentCanvas=document.createElement('canvas');environmentCanvas.width=1024;environmentCanvas.height=512;
  const ec=environmentCanvas.getContext('2d');
  const eg=ec.createLinearGradient(0,0,0,512);eg.addColorStop(0,'#8bc7ff');eg.addColorStop(.35,'#3f709e');eg.addColorStop(.55,'#07111d');eg.addColorStop(1,'#2e5b86');ec.fillStyle=eg;ec.fillRect(0,0,1024,512);
  ec.fillStyle='#edf6ff';ec.fillRect(150,60,95,230);ec.fillStyle='#a3cced';ec.fillRect(700,130,170,90);
  const env=new THREE.CanvasTexture(environmentCanvas);env.mapping=THREE.EquirectangularReflectionMapping;
  const pmrem=new THREE.PMREMGenerator(renderer);const envTarget=pmrem.fromEquirectangular(env);scene.environment=envTarget.texture;env.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xcce8ff,0x13243a,2.4));
  const key=new THREE.DirectionalLight(0xf1f7ff,4.5);key.position.set(3,8,6);scene.add(key);
  const rim=new THREE.DirectionalLight(0x3f9eff,5);rim.position.set(-4,4,-5);scene.add(rim);
  const fill=new THREE.DirectionalLight(0xabcfff,1.8);fill.position.set(0,2,6);scene.add(fill);
  const white=new THREE.MeshPhysicalMaterial({color:0xd3e0ec,metalness:.72,roughness:.25,clearcoat:1,clearcoatRoughness:.18});
  const blue=new THREE.MeshPhysicalMaterial({color:0x2676c6,metalness:.72,roughness:.27,clearcoat:1});
  const black=new THREE.MeshStandardMaterial({color:0x101b28,metalness:.48,roughness:.43});
  const rubber=new THREE.MeshStandardMaterial({color:0x09111b,metalness:.1,roughness:.82});
  const chrome=new THREE.MeshStandardMaterial({color:0xadcde5,metalness:1,roughness:.18});
  const led=new THREE.MeshStandardMaterial({color:0x9adaff,emissive:0x65bfff,emissiveIntensity:2.8,metalness:.4,roughness:.2});
  const lensMat=new THREE.MeshPhysicalMaterial({color:0x0b3766,metalness:.35,roughness:.08,clearcoat:1});
  function box(w,h,d,r=.08){
    const s=new THREE.Shape(),x=-w/2,y=-h/2;
    s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);
    const g=new THREE.ExtrudeGeometry(s,{depth:d,steps:1,bevelEnabled:true,bevelSegments:3,bevelSize:.025,bevelThickness:.025,curveSegments:5});g.translate(0,0,-d/2);return g;
  }
  function mesh(g,m,parent,pos=[0,0,0]){const o=new THREE.Mesh(g,m);o.position.set(...pos);parent.add(o);return o;}
  function cylinder(radius,length,material,parent,pos,axis='y'){
    const o=mesh(new THREE.CylinderGeometry(radius,radius,length,32),material,parent,pos);
    if(axis==='x')o.rotation.z=Math.PI/2;if(axis==='z')o.rotation.x=Math.PI/2;return o;
  }
  const rig=new THREE.Group();scene.add(rig);
  const robot=new THREE.Group();rig.add(robot);
  mesh(box(1.78,.48,2.6,.18),white,robot,[0,.36,0]);
  mesh(box(1.58,.13,2.28,.15),black,robot,[0,.68,0]);
  mesh(box(1.36,.12,1.45,.12),blue,robot,[0,.78,-.15]);
  for(const x of [-.82,.82]){
    mesh(box(.06,.08,2.04,.02),led,robot,[x,.62,0]);
    mesh(box(.12,.17,1.95,.04),black,robot,[x,.22,0]);
    for(const z of [-.65,.65])mesh(new THREE.SphereGeometry(.04,12,8),chrome,robot,[x,.55,z]);
  }
  const wheelAssemblies=[];const wheelRotors=[];
  for(const x of [-1.01,1.01])for(const z of [-.91,.91]){
    const assembly=new THREE.Group();assembly.position.set(x,0,z);robot.add(assembly);wheelAssemblies.push({group:assembly,base:assembly.position.clone(),direction:new THREE.Vector3(Math.sign(x)*.55,-.12,Math.sign(z)*.15)});
    const rotor=new THREE.Group();assembly.add(rotor);wheelRotors.push(rotor);
    cylinder(.42,.34,rubber,rotor,[0,0,0],'x');
    cylinder(.32,.36,black,rotor,[0,0,0],'x');
    cylinder(.245,.375,chrome,rotor,[0,0,0],'x');
    cylinder(.16,.39,blue,rotor,[0,0,0],'x');
    cylinder(.065,.415,chrome,rotor,[0,0,0],'x');
    const treadGeometry=new THREE.BoxGeometry(.38,.055,.095);
    const treads=new THREE.InstancedMesh(treadGeometry,rubber,32);const dummy=new THREE.Object3D();
    for(let i=0;i<32;i++){const a=i/32*Math.PI*2;dummy.position.set(0,Math.sin(a)*.42,Math.cos(a)*.42);dummy.rotation.x=-a;dummy.updateMatrix();treads.setMatrixAt(i,dummy.matrix);}
    rotor.add(treads);
    for(let i=0;i<6;i++){const a=i/6*Math.PI*2;cylinder(.018,.39,black,rotor,[0,Math.sin(a)*.22,Math.cos(a)*.22],'x');}
  }
  const sensorHead=new THREE.Group();sensorHead.position.set(0,.58,1.38);robot.add(sensorHead);
  mesh(box(.92,.26,.13,.065),black,sensorHead);
  for(const x of [-.25,.25]){cylinder(.1,.06,chrome,sensorHead,[x,0,.095],'z');cylinder(.074,.065,lensMat,sensorHead,[x,0,.13],'z');mesh(new THREE.SphereGeometry(.021,12,8),led,sensorHead,[x-.015,.018,.174]);}
  for(const x of [-.65,.65])mesh(box(.2,.085,.045,.025),led,robot,[x,.41,1.335]);
  const lidar=new THREE.Group();lidar.position.set(.49,.93,-.82);robot.add(lidar);
  cylinder(.16,.14,black,lidar,[0,0,0]);cylinder(.14,.055,lensMat,lidar,[0,.08,0]);cylinder(.11,.018,led,lidar,[0,.12,0]);
  const armBase=new THREE.Group();armBase.position.set(-.18,.88,-.35);robot.add(armBase);
  cylinder(.25,.17,black,armBase,[0,0,0]);cylinder(.19,.22,blue,armBase,[0,.12,0]);
  const shoulder=new THREE.Group();shoulder.position.y=.24;shoulder.rotation.z=-.4;armBase.add(shoulder);
  cylinder(.19,.35,chrome,shoulder,[0,0,0],'z');cylinder(.125,.37,blue,shoulder,[0,0,0],'z');
  mesh(box(.22,.78,.23,.08),white,shoulder,[0,.47,0]);mesh(box(.05,.61,.26,.015),black,shoulder,[-.055,.47,0]);
  const elbow=new THREE.Group();elbow.position.y=.94;elbow.rotation.z=1.15;shoulder.add(elbow);
  cylinder(.155,.31,chrome,elbow,[0,0,0],'z');cylinder(.1,.325,blue,elbow,[0,0,0],'z');
  mesh(box(.17,.67,.19,.07),white,elbow,[0,.4,0]);mesh(box(.055,.52,.215,.015),black,elbow,[.025,.4,0]);
  const wrist=new THREE.Group();wrist.position.y=.82;wrist.rotation.z=.4;elbow.add(wrist);
  cylinder(.105,.16,blue,wrist,[0,0,0]);mesh(box(.25,.13,.21,.04),black,wrist,[0,.12,0]);
  for(const x of [-.15,.15]){mesh(box(.06,.28,.13,.025),chrome,wrist,[x,.27,0]);mesh(box(.11,.055,.13,.015),rubber,wrist,[x*.78,.405,0]);}
  const cableCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.28,.91,-.25),new THREE.Vector3(-.45,1.5,-.25),new THREE.Vector3(-.4,2,-.15),new THREE.Vector3(-.9,1.92,-.12)]);
  mesh(new THREE.TubeGeometry(cableCurve,32,.023,6,false),black,robot);
  // Three intact ground-robot forms. Transition is a whole-object crossfade;
  // no components are detached or exploded during scrolling.
  const quadruped=new THREE.Group();rig.add(quadruped);
  // Pinned BSD-3-Clause Menagerie meshes; preserve MJCF joint/body hierarchy.
  const modelURL=new URL('./models/spot/model.json',import.meta.url);
  const [metadata,geometry]=await Promise.all([
    fetch(modelURL).then(r=>{if(!r.ok)throw new Error('Spot metadata unavailable');return r.json();}),
    fetch(new URL('./models/spot/geometry.bin',import.meta.url)).then(r=>{if(!r.ok)throw new Error('Spot geometry unavailable');return r.arrayBuffer();})
  ]);
  const spotMaterials={BlackAbs:new THREE.MeshStandardMaterial({color:0x17191c,roughness:.48,metalness:.18}),wrap:new THREE.MeshPhysicalMaterial({color:0xe8b530,roughness:.34,metalness:.25,clearcoat:.5})};
  const spotGeometry={};
  for(const [name,m] of Object.entries(metadata.meshes)){
    const g=new THREE.BufferGeometry();const buffer=new THREE.InterleavedBuffer(new Float32Array(geometry,m.offset,m.vertices*6),6);
    g.setAttribute('position',new THREE.InterleavedBufferAttribute(buffer,3,0));g.setAttribute('normal',new THREE.InterleavedBufferAttribute(buffer,3,3));g.setIndex(new THREE.BufferAttribute(new Uint32Array(geometry,m.indexOffset,m.indices),1));g.computeBoundingSphere();spotGeometry[name]=g;
  }
  const spotJoints={};
  function spotBody(data,parent){
    const group=new THREE.Group();group.name=data.name;group.position.set(...data.position);parent.add(group);
    if(data.joint){spotJoints[data.joint.name]=group;group.userData.axis=new THREE.Vector3(...data.joint.axis.split(' ').map(Number));}
    for(const m of data.meshes)mesh(spotGeometry[m.mesh],spotMaterials[m.material],group);
    for(const child of data.children)spotBody(child,group);
    return group;
  }
  const spotCoordinates=new THREE.Group();spotCoordinates.rotation.x=-Math.PI/2;spotCoordinates.rotation.z=Math.PI/2;spotCoordinates.scale.setScalar(3.8);quadruped.add(spotCoordinates);
  const spotBase=spotBody(metadata.body,spotCoordinates);spotBase.position.z=.46;
  for(const prefix of ['fl','fr','hl','hr']){
    spotJoints[prefix+'_hy'].rotation.y=1.04;spotJoints[prefix+'_kn'].rotation.y=-1.8;
    const foot=mesh(new THREE.SphereGeometry(.036,12,8),spotMaterials.BlackAbs,spotJoints[prefix+'_kn'],[0,0,-.3365]);
  }
  quadruped.position.y=-.45;
  document.documentElement.dataset.spotModel='ready';
  const forms={wheel:robot,quad:quadruped};
  const formMix={wheel:0,quad:1};let currentForm='quad';
  Object.values(forms).forEach(group=>{const materials=new Map();group.traverse(obj=>{if(!obj.material)return;const clone=m=>{if(!materials.has(m)){const c=m.clone();c.userData.originalOpacity=m.opacity;materials.set(m,c);}return materials.get(m);};obj.material=Array.isArray(obj.material)?obj.material.map(clone):clone(obj.material);});});
  document.querySelectorAll('[data-form]').forEach(button=>button.addEventListener('click',()=>{
    currentForm=button.dataset.form;
    document.querySelectorAll('[data-form]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    const next={wheel:0,quad:0};next[currentForm]=1;
    if(window.gsap&&!reducedMotion.matches)gsap.to(formMix,{...next,duration:.72,ease:'power2.inOut',overwrite:true,onUpdate:()=>{dirty=true;}});
    else {Object.assign(formMix,next);dirty=true;}
  }));
  const floor=new THREE.Group();scene.add(floor);floor.position.y=-.48;
  const disc=new THREE.Mesh(new THREE.CircleGeometry(3.2,96),new THREE.MeshStandardMaterial({color:0x123555,metalness:.75,roughness:.28,transparent:true,opacity:.55}));disc.rotation.x=-Math.PI/2;floor.add(disc);
  const grid=new THREE.PolarGridHelper(3.4,20,7,128,0x2b608a,0x224667);grid.material.transparent=true;grid.material.opacity=.28;floor.add(grid);
  for(const r of [2.2,2.85,3.45]){const ring=mesh(new THREE.TorusGeometry(r,.009,6,140),new THREE.MeshBasicMaterial({color:0x6797bd,transparent:true,opacity:.35}),floor);ring.rotation.x=Math.PI/2;ring.position.y=.018;}
  const glowCanvas=document.createElement('canvas');glowCanvas.width=256;glowCanvas.height=256;const gc=glowCanvas.getContext('2d');const gr=gc.createRadialGradient(128,128,0,128,128,128);gr.addColorStop(0,'rgba(55,125,195,.28)');gr.addColorStop(.45,'rgba(38,91,158,.15)');gr.addColorStop(1,'rgba(0,0,0,0)');gc.fillStyle=gr;gc.fillRect(0,0,256,256);
  const glow=mesh(new THREE.PlaneGeometry(10,10),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(glowCanvas),transparent:true,depthWrite:false}),floor,[0,-.025,0]);glow.rotation.x=-Math.PI/2;
  const rayGroup=new THREE.Group();robot.add(rayGroup);rayGroup.visible=false;
  const beamMat=new THREE.MeshBasicMaterial({color:0x76d8ff,transparent:true,opacity:.065,depthWrite:false,side:THREE.DoubleSide});
  const cone=mesh(new THREE.ConeGeometry(1.65,3.1,4,1,true),beamMat,rayGroup,[0,.6,3]);cone.rotation.x=-Math.PI/2;cone.rotation.y=Math.PI/4;
  const coneEdges=new THREE.LineSegments(new THREE.EdgesGeometry(cone.geometry),new THREE.LineBasicMaterial({color:0x9ce6ff,transparent:true,opacity:.24}));cone.add(coneEdges);
  const learningNodes=new THREE.Group();rig.add(learningNodes);learningNodes.visible=false;
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;mesh(new THREE.SphereGeometry(.035,12,8),led,learningNodes,[Math.cos(a)*2.5,1.25+Math.sin(a*2)*.5,Math.sin(a)*2.5]);}
  const lineGeometry=new THREE.BufferGeometry();const lp=[];for(let i=0;i<12;i++){const a=i/12*Math.PI*2,b=(i+4)%12/12*Math.PI*2;lp.push(Math.cos(a)*2.5,1.25+Math.sin(a*2)*.5,Math.sin(a)*2.5,Math.cos(b)*2.5,1.25+Math.sin(b*2)*.5,Math.sin(b)*2.5);}lineGeometry.setAttribute('position',new THREE.Float32BufferAttribute(lp,3));learningNodes.add(new THREE.LineSegments(lineGeometry,new THREE.LineBasicMaterial({color:0x79aaf9,transparent:true,opacity:.22})));
  const dustGeo=new THREE.BufferGeometry();const dust=[];let seed=415;function random(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646;}
  for(let i=0;i<(mobile.matches?280:650);i++)dust.push((random()-.5)*20,(random()-.2)*10,(random()-.5)*16);
  dustGeo.setAttribute('position',new THREE.Float32BufferAttribute(dust,3));const particles=new THREE.Points(dustGeo,new THREE.PointsMaterial({size:.02,color:0x8fcaff,transparent:true,opacity:.42,depthWrite:false}));scene.add(particles);
  const appOrbit=new THREE.Group();scene.add(appOrbit);appOrbit.visible=false;
  const appPanels=[];const loader=new THREE.TextureLoader();
  ['topdf','mtog','zoom'].forEach((name,i)=>{
    const group=new THREE.Group();appOrbit.add(group);
    mesh(box(.95,1.08,.08,.15),new THREE.MeshPhysicalMaterial({color:0x4c87bd,metalness:.35,roughness:.2,transparent:true,opacity:.6,clearcoat:1}),group);
    const texture=loader.load(`assets/${name}.png`,()=>{dirty=true;});texture.colorSpace=THREE.SRGBColorSpace;
    mesh(new THREE.PlaneGeometry(.72,.72),new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.DoubleSide}),group,[0,.055,.073]);
    mesh(new THREE.TorusGeometry(.075,.006,5,32),led,group,[0,-.43,.072]);appPanels.push(group);
  });
  let dirty=true,visible=!document.hidden,sceneTime=0,last=performance.now(),progress=0,mode='vision',selection=0;
  const pointer={x:0,y:0};const smooth={x:0,y:0};
  const state={rotation:-.5,x:0,scale:1,orbit:0,robotOpacity:1};
  const sections=[...document.querySelectorAll('[data-chapter]')];
  if(window.gsap&&window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
    const timeline=gsap.timeline({scrollTrigger:{trigger:document.querySelector('main'),start:'top top',end:'bottom bottom',scrub:reducedMotion.matches?true:1,onUpdate:s=>{progress=s.progress;dirty=true;}}});
    timeline.to(state,{rotation:.4,x:0,scale:1,duration:1},0)
      .to(state,{rotation:1.35,scale:.86,duration:1},1)
      .to(state,{rotation:2.4,scale:.62,orbit:1,duration:1},2);
    sections.forEach((section,i)=>ScrollTrigger.create({trigger:section,start:'top 52%',end:'bottom 52%',onToggle:s=>{if(s.isActive){document.querySelectorAll('.chapter-nav a').forEach((a,j)=>{if(j===i)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});document.body.dataset.chapter=String(i);dirty=true;}}}));
  }
  let lenis;
  if(!reducedMotion.matches&&!matchMedia('(pointer:coarse)').matches&&window.Lenis&&window.gsap){
    lenis=new Lenis({duration:1.12,smoothWheel:true,anchors:true});lenis.on('scroll',()=>ScrollTrigger.update());gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0);
  }
  function resize(){renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,mobile.matches?1.35:1.7));camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();dirty=true;}
  addEventListener('resize',resize,{passive:true});
  addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;pointer.x=e.clientX/innerWidth*2-1;pointer.y=e.clientY/innerHeight*2-1;dirty=true;},{passive:true});
  document.addEventListener('visibilitychange',()=>{visible=!document.hidden;last=performance.now();dirty=true;});
  function modeSelect(next){mode=next;document.querySelectorAll('[data-mode]').forEach(n=>{n.classList.toggle('active',n.dataset.mode===next);n.setAttribute('aria-pressed',String(n.dataset.mode===next));});document.getElementById('system-label').textContent=modes[next][0];document.getElementById('mode-description').textContent=modes[next][1];rayGroup.visible=mode==='vision';learningNodes.visible=mode==='learning';dirty=true;}
  const modes={vision:['PERCEPTION','카메라 시야와 센서 정보를 로봇의 상태 표현으로 연결합니다.'],control:['CONTROL','이동과 관절 동작을 제어 입력으로 연결하는 흐름을 살펴봅니다.'],learning:['VLA / POLICY','영상·언어·상태에서 행동으로 이어지는 VLA의 연결을 실험하려 합니다.']};
  document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{const next=b.dataset.mode;document.querySelectorAll('[data-mode]').forEach(n=>{n.classList.toggle('active',n===b);n.setAttribute('aria-pressed',String(n===b));});document.getElementById('system-label').textContent=modes[next][0];document.getElementById('mode-description').textContent=modes[next][1];modeSelect(next);}));
  const projects={simulation:['센서, 접촉 물리, 제어와 시연 수집을 연결하는 연구용 수중 환경입니다.','https://github.com/kanghyunmin-bot/ROS2-mujoco-UUVsimulator','control'],perception:['영상 특징 검출·추적·기하 검증을 위한 프런트엔드입니다. MP4 단독 경로는 임의 스케일입니다.','https://github.com/kanghyunmin-bot/UUV-VINS-SLAM','vision'],learning:['현재 공개된 수중 VLA·잔차 정책 연구입니다. 지상·공중 적용은 앞으로의 확장 방향입니다.','https://github.com/kanghyunmin-bot/ROS2-mujoco-UUVsimulator/tree/main/tools/vla_gui','learning']};
  document.querySelectorAll('[data-project]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-project]').forEach(n=>{n.classList.toggle('selected',n===b);n.setAttribute('aria-pressed',String(n===b));});const p=projects[b.dataset.project];document.getElementById('project-description').textContent=p[0];document.getElementById('project-link').href=p[1];modeSelect(p[2]);}));
  document.querySelectorAll('.preview-app').forEach(b=>b.addEventListener('click',()=>{selection=Number(b.dataset.app);document.querySelectorAll('.preview-app').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));if(lenis)lenis.scrollTo(document.getElementById('tools'));else document.getElementById('tools').scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth'});dirty=true;}));
  function motionState(){motionButton.setAttribute('aria-pressed',String(running));motionButton.textContent=running?'움직임 켜짐':'움직임 꺼짐';}
  motionState();motionButton.addEventListener('click',()=>{running=!running;motionState();dirty=true;});
  reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches){running=false;lenis?.destroy();lenis=null;motionState();dirty=true;}});
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();visible=false;document.documentElement.classList.remove('webgl-ready');});
  function frame(now){
    requestAnimationFrame(frame);if(!visible)return;
    const dt=Math.min((now-last)/1000,.05);last=now;
    if(running){sceneTime+=dt;dirty=true;}if(!dirty)return;dirty=false;
    smooth.x+=(pointer.x-smooth.x)*.055;smooth.y+=(pointer.y-smooth.y)*.055;
    const isMobile=mobile.matches;camera.position.set(isMobile?7:6.8,isMobile?4.8:4.6,isMobile?11.4:9.6);
    // Composition: robot right of the copy on desktop, below it on phones.
    const target=new THREE.Vector3(isMobile?0:-2.3,isMobile?2.8:1.05,0);camera.lookAt(target);
    robot.rotation.y=state.rotation+(running?smooth.x*.16:0);robot.rotation.x=running?smooth.y*.035:0;
    rig.position.y=running?Math.sin(sceneTime*.7)*.035:0;
    rig.scale.setScalar(state.scale*(isMobile?.85:1));
    const active=Number(document.body.dataset.chapter||0);
    Object.entries(forms).forEach(([name,group])=>{
      const amount=formMix[name];group.visible=amount>.005;
      const alpha=Math.min(1,amount);
      group.traverse(obj=>{if(!obj.material)return;const mats=Array.isArray(obj.material)?obj.material:[obj.material];mats.forEach(m=>{const original=m.userData.originalOpacity??m.opacity;m.userData.originalOpacity=original;const isFade=alpha<.995;m.transparent=isFade||original<1;m.opacity=original*alpha;m.depthWrite=!isFade;});});
      group.rotation.y=state.rotation+(running?smooth.x*.16+Math.sin(sceneTime*.45)*.16:0);
      group.position.x=running?Math.sin(sceneTime*.5)*(active===1?.32:.13):0;
      group.position.z=running?Math.cos(sceneTime*.5)*(active===1?.22:.1):0;
    });
    if(running){
      const gait=sceneTime*2.3;
      for(const [index,prefix] of ['fl','fr','hl','hr'].entries()){
        const phase=(index===0||index===3)?0:Math.PI;const wave=Math.sin(gait+phase);
        spotJoints[prefix+'_hy'].rotation.y=1.04+wave*.2;
        spotJoints[prefix+'_kn'].rotation.y=-1.8-Math.max(0,wave)*.28;
        spotJoints[prefix+'_hx'].rotation.x=Math.sin(sceneTime*.8)*.025;
      }
      spotBase.position.z=.46+Math.abs(Math.sin(gait))*.006;

    }
    if(running){wheelRotors.forEach(w=>w.rotation.x=sceneTime*(active===1?.7:.2));shoulder.rotation.z=-.4+Math.sin(sceneTime*.7)*.07;elbow.rotation.z=1.15+Math.sin(sceneTime*.6)*.1;lidar.rotation.y=sceneTime*.9;learningNodes.rotation.y=sceneTime*.15;particles.rotation.y=sceneTime*.006;}
    rayGroup.visible=mode==='vision'&&currentForm==='wheel'&&active>0&&active<3;learningNodes.visible=mode==='learning'&&active>0&&active<3;
    appOrbit.visible=state.orbit>.025;
    if(appOrbit.visible){appOrbit.scale.setScalar(state.orbit);appPanels.forEach((p,i)=>{const a=(i-selection)/3*Math.PI*2+Math.PI/2;p.position.set(Math.cos(a)*2.1,.9+Math.sin(a)*.32,Math.sin(a)*1.9);p.lookAt(camera.position);p.scale.setScalar(i===selection?1.13:.85);});}
    document.querySelector('.scene-progress div').style.transform=`scaleX(${progress})`;
    renderer.render(scene,camera);
  }
  frame(performance.now());document.documentElement.classList.add('webgl-ready');document.documentElement.dataset.robotScene='ready';
} catch(error) {
  console.warn('3D unavailable: showing the ground robot poster.',error);
  render?.dispose();document.documentElement.dataset.robotScene='fallback';
  motionButton.disabled=true;motionButton.textContent='정적 장면';
  document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll('[data-mode]').forEach(n=>{n.setAttribute('aria-pressed',String(n===b));n.classList.toggle('active',n===b);});
    const descriptions={vision:['PERCEPTION','카메라 시야와 센서 정보를 로봇의 상태 표현으로 연결합니다.'],control:['CONTROL','이동과 관절 동작을 제어 입력으로 연결하는 흐름을 살펴봅니다.'],learning:['VLA / POLICY','영상·언어·상태에서 행동으로 이어지는 VLA의 연결을 실험하려 합니다.']};
    const v=descriptions[b.dataset.mode];document.getElementById('system-label').textContent=v[0];document.getElementById('mode-description').textContent=v[1];
  }));
  document.querySelectorAll('[data-project]').forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll('[data-project]').forEach(n=>{n.setAttribute('aria-pressed',String(n===b));n.classList.toggle('selected',n===b);});
    const data={simulation:['센서, 접촉 물리, 제어와 시연 수집을 연결하는 연구용 수중 환경입니다.','https://github.com/kanghyunmin-bot/ROS2-mujoco-UUVsimulator'],perception:['영상 특징 검출·추적·기하 검증을 위한 프런트엔드입니다.','https://github.com/kanghyunmin-bot/UUV-VINS-SLAM'],learning:['현재 공개된 수중 VLA·잔차 정책 연구입니다. 지상·공중 적용은 앞으로의 확장 방향입니다.','https://github.com/kanghyunmin-bot/ROS2-mujoco-UUVsimulator/tree/main/tools/vla_gui']};
    const v=data[b.dataset.project];document.getElementById('project-description').textContent=v[0];document.getElementById('project-link').href=v[1];
  }));
  document.querySelectorAll('.preview-app').forEach(b=>{b.disabled=true;b.textContent='3D 미리보기 사용 불가';});
  document.querySelectorAll('[data-form]').forEach(b=>{b.disabled=true;b.setAttribute('aria-label',b.textContent+' — 3D 사용 불가');});
}
