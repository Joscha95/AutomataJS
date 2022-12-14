const a_settings = {
  selectColor: '#919191',
  strokeColor: '#878787',
  fillColor: '#333333',
  activeColor: '#ffa800',
  textColor: '#d9d9d9',
  triggeredColor: '#2f8f58',
  strokeWidth: 3,
  strokeWidthActive: 5,
}

class BaseAutomataItem {
  constructor(isEditor, name, id){
    this.name = name;
    this.id = id;
    this.elapsedTime = 0;
    this.duration = 1;
    this.progress = 0;
    this.deleted = false;
    this.isEditor = isEditor;

    if(!this.isEditor) return;

    this.title = new PointText({
    	content: this.name,
    	justification: 'center',
    	fontSize: 10,
      fillColor: a_settings.textColor
    });

    view.update();
  }


  update() {
    this.elapsedTime++;
    this.progress = Math.min(this.elapsedTime/this.duration,1);
  }


  updateName(newname){
    this.name = newname;
    this.title.content = this.name;
    view.update();
  }

  activate(){
    this.path.strokeColor = a_settings.activeColor;
    view.update();
  };

  reset(){
    this.elapsedTime=0;
    this.progress=0;

    if(!this.isEditor) return;

    this.path.strokeColor = this.triggered ? a_settings.triggeredColor : a_settings.strokeColor;
    view.update();
  }
}

class State extends BaseAutomataItem {
  constructor(name, position, isEditor, id = null){
    super(isEditor, name, id || 'AID_'+Date.now());
    this.position = position;
    this.transitionTo = [];
    this.transitionFrom = [];

    if(!this.isEditor) return;

    this.path = new Path.Circle({
  		radius: 50,
      strokeColor: a_settings.strokeColor,
      fillColor: a_settings.fillColor,
      strokeWidth: a_settings.strokeWidth
  	});

    this.group = new Group([this.path,this.title]);
    this.group.position = this.position;
    this.group.name = this.id;

    view.update();
  }

  nextTransition(){
    return this.transitionTo.find( t => t.triggered || t.triggerOnce);
  }

  focus(){
    this.path.fillColor = a_settings.selectColor;
    this.title.fillColor = 'black';
    view.update();
  }

  unfocus(){
    this.path.fillColor = a_settings.fillColor;
    this.title.fillColor = a_settings.strokeColor;
    view.update();
  }

  updatePosition(delta = new Point(0,0)){
    this.position = this.position.add(delta);

    this.group.position = this.position;
    this.transitionTo.forEach((item) => {
      item.updatePosition();
    });
    this.transitionFrom.forEach((item) => {
      item.updatePosition();
    });

    view.update();

  }

  delete(){
    this.deleted = true;
    this.transitionTo.forEach((item) => {
      item.delete();
    });
    this.transitionFrom.forEach((item) => {
      item.delete();
    });

    if(!this.isEditor) return;
    this.group.remove();
    view.update();

  }
}

class Transition extends BaseAutomataItem {

  constructor(name,startState,isEditor,id = null){
    super(isEditor,name, id || 'AID_'+Date.now());
    this.startState = startState;
    this.endState = null;
    this.triggered = false;
    this.triggerOnce = false;

    if(!this.isEditor) return;

    this.isReverse = false;

    this.path = new Path(this.startState.position,this.startState.position);
    this.path.strokeColor = a_settings.strokeColor;
    this.path.strokeWidth = a_settings.strokeWidth;

    this.arrow = createArrow(startState.position,startState.position);
    this.arrow.strokeColor = this.path.strokeColor;

    //this.title.shadowColor = 'black';
    //this.title.shadowBlur = 2;

    this.group = new Group([this.path,this.title]);
    this.group.name = this.id;
    this.group.sendToBack();
  }


  focus(){
    this.path.strokeColor = a_settings.textColor;
    this.arrow.strokeColor = this.path.strokeColor;
    view.update();
  };

  unfocus(){
    this.path.strokeColor = this.triggered ? a_settings.triggeredColor : a_settings.strokeColor;
    this.arrow.strokeColor = this.path.strokeColor;
    view.update();
  };

  setEndState(state){
    this.endState = state;

    const tr = this.endState.transitionTo.find( t => t.endState == this.startState);

    if(tr) this.isReverse = tr.isReverse = true;
  }

  updatePosition(mousePos=null){
    this.arrow.remove();

    if (this.endState==null && mousePos) {
      this.path.segments[0].point = this.startState.position;
      this.path.segments[1].point = mousePos;
      this.arrow = createArrow(this.startState.position,mousePos);
    } else if(this.isReverse) {
      const startPos = this.startState.position;
      const endPos = this.endState.position;
      const vector = endPos.subtract(startPos);

      vector.length = 20;

      this.path.segments[0].point = this.startState.position.add(vector.rotate(90));
      this.path.segments[1].point = this.endState.position.add(vector.rotate(90));
      this.arrow = createArrow(this.startState.position,this.path.getIntersections(this.endState.path)[0] ? this.path.getIntersections(this.endState.path)[0].point : this.startState.position);
    } else {
      this.path.segments[0].point = this.startState.position;
      this.path.segments[1].point = this.endState.position;
      this.arrow = createArrow(this.startState.position,this.path.getIntersections(this.endState.path)[0] ? this.path.getIntersections(this.endState.path)[0].point : this.startState.position);
    }


    this.arrow.sendToBack();
    this.arrow.strokeColor = this.path.strokeColor;
    this.title.position = this.path.segments[1].point.add(this.path.segments[0].point.subtract(this.path.segments[1].point).divide(2));
    this.arrow.strokeWidth = a_settings.strokeWidth;
    view.update();
  };

  delete(){
    if (this.startState && !this.startState.deleted) {
      const ind = this.startState.transitionTo.findIndex(t => t.id===this.id);
      if (ind>=0){
        this.startState.transitionTo.splice(ind,1);
      }

    }

    if (this.endState && !this.endState.deleted) {
      const ind = this.endState.transitionFrom.findIndex(t => t.id===this.id);
      if (ind>=0){
        this.endState.transitionFrom.splice(ind,1);
      }
    }

    if(!this.isEditor) return;

    this.group.remove();
    this.arrow.remove();

    view.update();
  };
}

function createArrow(startPos,endPos) {
  const vector = endPos.subtract(startPos);
  vector.length = 15;
  const arrowPath = new Path([
    endPos.add(vector.rotate(135)),
    endPos,
    endPos.add(vector.rotate(-135))]);
  arrowPath.strokeColor=a_settings.strokeColor;
  return arrowPath;
}

class Automata{
  constructor(isEditor){
    this.isEditor = isEditor;
    this.activeState = new State('init',this.isEditor ? new Point(50,50) : null, this.isEditor);

    this.activeTransition = null;
    this.states = [this.activeState];
    this.transitions = [];
    this.changed = false;
    this.onChanged = () => {};

    this.onLoaded = [];

    this.onStateChanged = () => {};

    if(!this.isEditor) return;
    this.activeState.activate();

    this.elementDragged = false;

    this.inspector = new Inspector();
    this.inspector.setSelectedEl(this.activeState);

    this.inspector.deleteElement = (el)=>{this.deleteElement(el)};

    this.tool = null;

    this.setUpInteractions();

  }

  export(){
    const a_export = {
      states: this.states.map((s) => {
        return {
          name: s.name,
          id : s.id,
          duration : s.duration,
          position : {x:s.position.x,y:s.position.y},
          'transitionTo' : s.transitionTo.map(t => t.id),
          'transitionFrom' : s.transitionFrom.map(t => t.id)
        }
      }),
      transitions: this.transitions.map((t) => {
        return {
          name: t.name,
          id : t.id,
          duration : t.duration,
          triggered : t.triggered,
          isReverse : t.isReverse,
          startState : t.startState.id,
          endState : t.endState.id
        }
      }),

    }

    return a_export;

  }

  load(objects){

    project.clear();
    this.states = [];
    this.transitions = [];
    this.inspector.setSelectedEl();

    let n;
    objects.states.forEach((item, i) => {
      n = new State(item.name, this.isEditor ? new Point(item.position.x,item.position.y) : null , this.isEditor, item.id);

      n.duration = item.duration;
      n.transitionFrom = item.transitionFrom;
      n.transitionTo = item.transitionTo;

      this.states.push(n)
    });


    objects.transitions.forEach((item, i) => {

      const startState = this.states.find(s => s.id == item.startState);
      const endState = this.states.find(s => s.id == item.endState);

      n = new Transition(item.name, startState, this.isEditor, item.id);
      n.triggered = item.triggered;
      n.isReverse = item.isReverse;
      n.setEndState(endState);
      n.duration = item.duration;

      this.transitions.push(n);

      n.updatePosition();
    });

    this.states.forEach((s, i) => {
      s.transitionFrom = s.transitionFrom.map( t => this.transitions.find(t2 => t2.id==t))
      s.transitionTo = s.transitionTo.map( t => this.transitions.find(t2 => t2.id==t))
    });

    this.setState(this.states[0]);

    this.onLoaded.forEach(func => func());
  }

  setUpInteractions(){
    this.tool = new Tool();
    let selectedObject;
    let newTransition;

    const hitOptions = {
    	segments: true,
    	stroke: true,
    	fill: true,
    	tolerance: 5
    };

    const interactions = {
    	leftclick: (event)=>{return event.event.button==0},
    	rightclick: (event)=>{return event.event.button==2},
    	shiftLeftclick: (event) =>{return event.modifiers.shift && event.event.button==0},
    	cmdLeftclick: (event) =>{return event.modifiers.command && event.event.button==0},
    }

    this.tool.onMouseDown = (event) => {


      if (selectedObject)
        selectedObject.unfocus();

      selectedObject=null;
    	this.inspector.setSelectedEl(null);
      const hitResult = project.hitTest(event.point, hitOptions);

    	view.update();

    	if (!hitResult){
        if (interactions.shiftLeftclick(event)) {
          this.states.push(new State('State',event.point,this.isEditor));
          this.changed = true;
        }

        return;
      }

      if (newTransition && hitResult.type=='segment') {
        newTransition.delete();
        newTransition=null;
        return;
      }

      selectedObject=this.states.find(obj => {return obj.id===hitResult.item.parent.name});

    	if(!selectedObject) selectedObject=this.transitions.find(obj => {return obj.id===hitResult.item.parent.name});

    	if (interactions.cmdLeftclick(event) && selectedObject.constructor.name==='State') {
    		this.forceState(selectedObject);
    	}

    	this.inspector.setSelectedEl(selectedObject);
      if (selectedObject)
        selectedObject.focus();

      if(newTransition && selectedObject.constructor.name==='State'){
        const double = this.transitions.find( t => {
          return t.startState.id === newTransition.startState.id && t.endState.id === selectedObject.id
        });
        if (double || newTransition.startState.id===selectedObject.id) {
          alert('transition already exists or not possible');
          newTransition.delete();
          newTransition=null;
          return;
        }
        selectedObject.transitionFrom.push(newTransition);
        newTransition.setEndState(selectedObject);
        newTransition.updateName('To'+selectedObject.name);
        this.transitions.push(newTransition);
        newTransition=null;
        this.changed = true;
        selectedObject.updatePosition();
        return;
      }


      if (interactions.rightclick(event) && !newTransition && selectedObject.constructor.name==='State') {
        newTransition=new Transition('Transition',selectedObject,this.isEditor);
        selectedObject.transitionTo.push(newTransition);
      }
    }

    this.tool.onMouseDrag = (event) => {
      if (selectedObject && interactions.leftclick(event) && selectedObject.constructor.name==='State') {
        selectedObject.updatePosition(event.delta);
        this.elementDragged = true;
      } else {
        var pan_offset = event.point.subtract(event.downPoint);
        view.center = view.center.subtract(pan_offset);
        view.update();
      }

    }

    this.tool.onMouseMove = (event) => {
      if (newTransition) {
        newTransition.updatePosition(event.point);
      }
    }

    this.tool.onMouseUp = (event) => {
      if (this.elementDragged) {
        this.changed = true;
        this.elementDragged = false;
      }
    }
  }

  setState(state){
    this.activeState.reset();
    this.activeState = state;
    this.activeState.activate();
  }

  deleteElement(el){
    const type = el.constructor.name;
    if(type==='State' && this.states.length==1) {
      alert('You must have at least one State');
      return;
    }

    if (type==='State') {
      const ind = this.states.findIndex(t => t.id===el.id);
      if (ind >= 0){
        this.states.splice(ind,1);

        [...el.transitionTo,...el.transitionFrom].forEach((item, i) => {
          const ind = this.transitions.findIndex(t => t.id===item.id);
          if (ind>=0) {
            this.transitions.splice(ind,1);
          }
        });

      }

    }else if (type==='Transition') {
      const ind = this.transitions.findIndex(t => t.id===el.id);
      if (ind>=0) {
        this.transitions.splice(ind,1);
        const revTr = this.transitions.find( t => t.endState == el.startState && t.startState == el.endState );
        if(revTr) revTr.isReverse = false;
      }
    }

    if (this.activeState.id===el.id) {
      this.forceState(this.states[0]);
    } else if (this.activeTransition && this.activeTransition.id===el.id) {
      this.activeTransition=null;
    }

    el.delete();
    this.changed = true;
  }



  forceState(state){
    this.activeState.reset();
    this.activeState = state;
    this.activeState.activate();
    this.setTransition(null);
  }

  setTransition(transition){
    if (this.activeTransition) {
      this.activeTransition.reset();
    }

    this.activeTransition=transition;
    if (this.activeTransition)
      this.activeTransition.activate();
  }

  triggerTransitionOnce(transition){
    transition.triggerOnce = true;
  }

  update(){
    if (this.activeTransition) {

      if (this.activeTransition.progress===1 && this.activeTransition.endState) {
        this.activeState.reset();
        this.setState(this.activeTransition.endState);
        this.setTransition(null);
        this.onStateChanged();

        if(!this.isEditor) return;

        view.update();

        return;
      }

      this.activeTransition.update();

    } else {

      if (this.activeState.progress === 1 && this.activeState.transitionTo[0] && this.activeState.nextTransition()) {

        this.setTransition(this.activeState.nextTransition());
        this.onStateChanged();

        if(!this.isEditor) return;

        view.update();

        return;
      }

      this.activeState.update();
    }

    this.transitions.forEach((item) => {
      item.triggerOnce = false;
    });

    if(!this.isEditor) return;
    this.inspector.updateTime();

    if(this.changed){
        this.onChanged();
        this.changed = false;
      }
  }
}

class Inspector {
  constructor(){
    this.domEl = this.createDOMElement();

    this.changed = false;

    this.deleteElement=()=>{};

    const _elname = this.createInput('Name','text');
    const _eldur = this.createInput('Duration','number');
    const _eltrig = this.createInput('Triggered','checkbox');

    this.elname = _elname.querySelector('input');
    this.elduration = _eldur.querySelector('input');
    this.eltriggered = _eltrig.querySelector('input');

    this.elprogress = document.createElement('SPAN');
    this.elelapsed = document.createElement('SPAN');
    this.eldeletebtn = document.createElement('BUTTON');
    this.eldeletebtn.name = 'delete';
    this.eldeletebtn.innerHTML = 'Delete';

    const tEl = document.createElement('DIV');
    tEl.classList.add('inspector_row')
    tEl.append(this.elprogress,this.elelapsed);

    const dEl = document.createElement('DIV');
    dEl.classList.add('inspector_row')
    dEl.append(this.eldeletebtn);

    this.domEl.append(
      _elname,
      _eldur,
      _eltrig,
      tEl,
      dEl
    )

    this.selectedel=null;

    this.eldeletebtn.onmousedown=()=>{
      if (this.selectedel) this.deleteElement(this.selectedel);
    }

    this.eltriggered.onchange = (e) =>{

      if(this.selectedel.constructor.name != 'Transition') return;
      this.selectedel.triggered = e.target.checked;

      this.selectedel.path.strokeColor = this.selectedel.triggered ? a_settings.triggeredColor : a_settings.strokeColor ;
      this.selectedel.arrow.strokeColor = this.selectedel.path.strokeColor;
      view.update();
      this.changed = true;
    }

    this.elname.onkeyup = (e)=>{
      if(!this.selectedel) return;
      this.selectedel.updateName(e.target.value);
      this.changed = true;
    }

    this.elduration.onkeyup = this.elduration.onmouseup=(e)=>{
      if(!this.selectedel) return;
      this.selectedel.duration=e.target.value;
      this.changed = true;
    }
  }



  updateTime(){
    if(this.selectedel){
      this.elprogress.innerHTML= 'Progress: '+this.selectedel.progress;
      this.elelapsed.innerHTML= 'Elapsed: '+this.selectedel.elapsedTime;
    }
  }

  setSelectedEl(el){
    this.selectedel=el;
    if (!el) {
      this.elname.value='';
      this.elduration.value=0;
      this.elprogress.innerHTML= '';
      this.elelapsed.innerHTML= '';
      this.domEl.style.display = 'none';
      return;
    }
    this.elname.value=el.name;
    this.elduration.value=el.duration;

    this.domEl.style.display = 'block';
    this.eltriggered.parentNode.style.display = this.selectedel.constructor.name == 'Transition' ? 'block' : 'none';


    this.eltriggered.checked = el.triggered;

    view.update();
  }

  createDOMElement(){
    const el = document.createElement('DIV');
    el.id = "inspector";

    const style = document.createElement('Style');
    style.innerText = `
    #inspector .inspector_row{
      height:30px;
      display: flex;
      position: relative;
      align-items: center;
    }
    #inspector .inspector_row > *{
      flex:1;
    }
    #inspector .inspector_row > *:first-of-type{
      padding-right: 5px;
    }
    #inspector{
      position: absolute;
      top:0;
      right:0;
      padding:10px;
      background-color: #303030;
      border-radius: 10px;
    }`;

    document.head.appendChild(style);

    return el;
  }

  createInput(name, type ){
    const wrap = document.createElement('DIV');
    wrap.classList.add('inspector_row');
    const label = document.createElement('LABEL');
    const input = document.createElement('INPUT');

    const slug = name.toLocaleLowerCase().replace(' ','-');

    label.innerHTML = name;
    label.for = slug;

    input.type = type;
    input.name = slug;

    wrap.append(label,input);

    return wrap;
  }
}
