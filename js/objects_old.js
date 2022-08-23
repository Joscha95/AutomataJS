const a_settings = {
  focusColor: '#eff4ef',
  strokeColor: 'black',
  fillColor: 'white',
  activeColor: '#bac308'
}

class BaseAutomataItem {
  constructor(name){
    this.name = name;
    this.id = 'AID_'+Date.now();
    this.elapsedTime=0;
    this.duration=1000;
    this.progress=0;
    this.deleted=false;

    this.title = new PointText({
    	content: this.name,
    	justification: 'center',
    	fontSize: 10
    });

    view.update();
  }


  update() {
    this.elapsedTime++;
    this.progress=Math.min(this.elapsedTime/this.duration,1);
  }


  updateName(newname){
    this.name=newname;
    this.title.content=this.name;
    view.update();
  }

  activate(){
    this.path.strokeColor = a_settings.activeColor;
    this.path.dashArray = [10, 10];
    view.update();
  };

  reset(){
    this.elapsedTime=0;
    this.progress=0;
    this.path.strokeColor='black';
    this.path.dashArray=[];
    view.update();
  }
}

class State extends BaseAutomataItem {
  constructor(name,position){
    super(name);
    this.position = position;
    this.transitionTo=[];
    this.transitionFrom=[];

    this.path = new Path.Circle({
  		radius: 50,
      strokeColor: a_settings.strokeColor,
      fillColor: a_settings.fillColor
  	});

    this.group = new Group([this.path,this.title]);
    this.group.position = this.position;
    this.group.name= this.id;

    view.update();
  }

  nextTransition(){
    return this.transitionTo.find( t => t.triggered);
  }


  focus(){
    this.path.fillColor = a_settings.focusColor;
    view.update();
  }

  unfocus(){
    this.path.fillColor = a_settings.fillColor;
    view.update();
  }

  updatePosition(delta=new Point(0,0)){
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
    this.deleted=true;
    this.transitionTo.forEach((item) => {
      item.delete();
    });
    this.transitionFrom.forEach((item) => {
      item.delete();
    });
    this.group.remove();
    view.update();

  }
}



class State_x {
  constructor(name,position){
    this.name = name;
    this.id = 'S_'+Date.now();
    this.position = position;
    this.elapsedTime=0;
    this.transitionTo=[];
    this.transitionFrom=[];
    this.duration=1000;
    this.progress=0;
    this.deleted=false;

    this.path = new Path.Circle({
  		radius: 50,
      strokeColor: a_settings.strokeColor,
      fillColor: a_settings.fillColor
  	});

    this.title = new PointText({
    	content: this.name,
    	justification: 'center',
    	fontSize: 10
    });

    this.group = new Group([this.path,this.title]);
    this.group.position = this.position;
    this.group.name= this.id;

    view.update();

  }


  update() {
    this.elapsedTime++;
    this.path.dashOffset--;
    this.progress=Math.min(this.elapsedTime/this.duration,1);
  }


  updateName(newname){
    this.name=newname;
    this.title.content=this.name;
    view.update();
  }

  nextTransition(){
    return this.transitionTo.find( t => t.triggered);
  }


  focus(){
    this.path.fillColor = a_settings.focusColor;
    view.update();
  }

  unfocus(){
    this.path.fillColor = a_settings.fillColor;
    view.update();

  }

  activate(){
    this.path.strokeColor = a_settings.activeColor;
    this.path.dashArray = [10, 10];
    view.update();

  };

  reset(){
    this.elapsedTime=0;
    this.progress=0;
    this.path.strokeColor='black';
    this.path.dashArray=[];
    view.update();

  }

  updatePosition(delta=new Point(0,0)){
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
    this.deleted=true;
    this.transitionTo.forEach((item) => {
      item.delete();
    });
    this.transitionFrom.forEach((item) => {
      item.delete();
    });
    this.group.remove();
    view.update();

  }
}

class Transition {

  constructor(name,startState){
    this.name = name;
    this.id = 'T_'+Date.now();
    this.startState = startState;
    this.endState = null;
    this.triggered = false;
    this.elapsedTime = 0;

    this.duration = 500;
    this.progress = 0;

    this.path = new Path(this.startState.position,this.startState.position);
    this.path.strokeColor = a_settings.strokeColor;

    this.arrow = createArrow(startState.position,startState.position);

    this.title = new PointText({
    	content: this.name,
    	justification: 'center',
    	fontSize: 10,
      color: a_settings.strokeColor
    });

    this.group = new Group([this.path,this.title]);
    this.group.name = this.id;
    this.group.sendToBack();
  }


  activate(){
    this.path.strokeColor=a_settings.activeColor;
    this.path.dashArray=[10, 10];
    view.update();

  }



  updateName(newname){
    this.name=newname;
    this.title.content=this.name;
    view.update();

  }

  focus(){
    this.path.strokeColor = a_settings.focusColor;
    view.update();

  };
  unfocus(){
    this.path.strokeColor = a_settings.strokeColor;
    view.update();

  };

  reset(){
    this.elapsedTime = 0;
    this.progress = 0;
    this.path.strokeColor = a_settings.strokeColor;
    this.path.dashArray = [];
  }

  update(){
    this.elapsedTime++;
    //this.path.dashOffset--;
    this.progress=Math.min(this.elapsedTime/this.duration,1);
  }

  updatePosition(mousePos=null){
    this.arrow.remove();
    view.update();

    if (this.endState==null && mousePos) {
      this.path.segments[0].point = this.startState.position;
      this.path.segments[1].point = mousePos;
      this.arrow = createArrow(this.startState.position,mousePos);
    }else {
      this.path.segments[0].point = this.startState.position;
      this.path.segments[1].point = this.endState.position;
      this.arrow = createArrow(this.startState.position,this.path.getIntersections(this.endState.path)[0].point);
    }
    this.arrow.sendToBack();
    this.title.position = this.path.segments[1].point.add(this.path.segments[0].point.subtract(this.path.segments[1].point).divide(2));
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

    this.group.remove();
    this.arrow.remove();

    view.update();
  };
}

function createArrow(startPos,endPos) {
  const vector=endPos.subtract(startPos);
  vector.length=10;
  const arrowPath = new Path([
    endPos.add(vector.rotate(135)),
    endPos,
    endPos.add(vector.rotate(-135))]);
  arrowPath.strokeColor=a_settings.strokeColor;
  return arrowPath;
}

class Automata{
  constructor(){
    this.activeState = new State('init',new Point(50,50));
    this.activeState.activate();
    this.activeTransition = null;
    this.states = [this.activeState];
    this.transitions = [];
    this.inspector=new Inspector();
    this.inspector.setSelectedEl(this.activeState);

    this.inspector.deleteElement = (el)=>{this.deleteElement(el)};

    this.isEditor = true;

    this.tool = null;

    if(this.isEditor) this.setUpInteractions();

    console.log(true,'done');

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
          this.states.push(new State('State',event.point));
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
        newTransition.endState=selectedObject;
        this.transitions.push(newTransition);
        newTransition=null;
        selectedObject.updatePosition();
        return;
      }


      if (interactions.rightclick(event) && !newTransition && selectedObject.constructor.name==='State') {
        newTransition=new Transition('Transition',selectedObject);
        selectedObject.transitionTo.push(newTransition);
      }
    }

    this.tool.onMouseDrag = (event) => {
      if (selectedObject && interactions.leftclick(event) && selectedObject.constructor.name==='State') {
        selectedObject.updatePosition(event.delta);
      }
    }

    this.tool.onMouseMove = (event) => {
      if (newTransition) {
        newTransition.updatePosition(event.point);
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
      if (ind>=0)
        this.states.splice(ind,1);
    }else if (type==='Transition') {
      const ind = this.transitions.findIndex(t => t.id===el.id);
      if (ind>=0)
        this.transitions.splice(ind,1);
    }

    if (this.activeState.id===el.id) {
      this.forceState(this.states[0]);
    } else if (this.activeTransition && this.activeTransition.id===el.id) {
      this.activeTransition=null;
    }

    el.delete();
  }



  forceState(state){
    this.activeState.reset();
    this.activeState=state;
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

  update(){
    if (this.activeTransition) {

      if (this.activeTransition.progress===1 && this.activeTransition.endState) {
        this.activeState.reset();
        this.setState(this.activeTransition.endState);
        this.setTransition(null);

        view.update();

        return;
      }

      this.activeTransition.update();

    } else {

      if (this.activeState.progress===1 && this.activeState.transitionTo[0] && this.activeState.nextTransition()) {
        this.setTransition(this.activeState.nextTransition());
        view.update();

        return;
      }

      this.activeState.update();
    }

    this.inspector.updateTime();
  }
}

class Inspector {
  constructor(deleteEl){
    this.parentDom = document.querySelector('#inspector');

    this.parentDom.style.position = 'absolute';
    this.parentDom.style.top = 0;
    this.parentDom.style.right = 0;
    this.parentDom.style.padding = '10px';

    this.deleteElement=deleteEl;
    this.elname = this.parentDom.querySelector("input[name='statename']");
    this.elprogress = this.parentDom.querySelector('#el_progress');
    this.elelapsed = this.parentDom.querySelector('#el_elapsed');
    this.elduration = this.parentDom.querySelector("input[name='duration']");
    this.eltriggered = this.parentDom.querySelector("input[name='triggered']");
    this.eldeletebtn = this.parentDom.querySelector("button[name='delete']");
    this.selectedel=null;

    this.eldeletebtn.onmousedown=()=>{
      if (this.selectedel) this.deleteElement(this.selectedel);
    }

    this.eltriggered.onchange = (e) =>{
      this.selectedel.triggered=e.target.checked;
    }

    this.elname.onkeyup=(e)=>{
      if(!this.selectedel) return;
      this.selectedel.updateName(e.target.value);
    }

    this.elduration.onkeyup=this.elduration.onmouseup=(e)=>{
      if(!this.selectedel) return;
      this.selectedel.duration=e.target.value;
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
      this.parentDom.style.display = 'none';
      return;
    }
    this.elname.value=el.name;
    this.elduration.value=el.duration;
    this.parentDom.style.display = 'block';
    this.parentDom.parentNode.style.position='relative';



    this.eltriggered.checked = el.triggered;

    view.update();

  }
}