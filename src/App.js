import React, { Component } from 'react';
import './App.css';
import  sha1 from 'sha1';
import  marked from 'marked';

import  {HashRouter as Router, Route, Link} from 'react-router-dom';

import {ListGroup, ListGroupItem,Modal,ModalHeader,ModalBody, Badge,Container,Row,Col, Input,Breadcrumb,BreadcrumbItem} from 'reactstrap';

const kServer = "https://garfeng.net/";

function urlOf(path) {
  const timecode = Math.floor(new Date().getTime() / 1000);
  const timecode_s = timecode.toString(10);
  const s = path.replace(/\//ig,"");
  const h = sha1(timecode_s+s);
  const url = `data/${timecode_s}/${h}/${path}`;
  return url.replace(/\/\//ig, "/");
}

function fullUrl(path) {
  return kServer + urlOf(path);
}

class Data extends Component {
  constructor(props) {
    super(props);

    this.renderImage = this.renderImage.bind(this);
    this.renderDir = this.renderDir.bind(this);
    this.renderOthrerFile = this.renderOthrerFile.bind(this);
    this.ShowImage = this.ShowImage.bind(this);
    this.toggle = this.toggle.bind(this);
    
    this.state = {
      show_image:false
    };
    this.imgObj = new Image();

    const data = this.props.data || {"filename":"","path":"","type":"dir"};
    this.url = fullUrl(data.path);
  }

  ShowImage(){
    this.toggle();
  }

  toggle(){
    this.setState({show_image:!this.state.show_image});
  }

  fileSize(data){
    if(data < 1024) {
      return `${data} b`;
    }
    data = data >> 10;
    if(data < 1024) {
      return `${data} Kb`;
    }

    data = data >> 10;

    if(data < 1024) {
      return `${data} Mb`;
    }

    data = data >> 10;

    return `${data} Gb`;
  }

  fileModTime(data) {
    var t = new Date(data * 1000);
    return t.toLocaleDateString() + " " + t.toLocaleTimeString();
  }

  otherInfo(data){
    return <span className="text-muted" style={{fontSize:"0.8em"}}>{" "}({this.fileSize(data.filesize||0)} - {this.fileModTime(data.mod_time||0)})</span>
  }

  renderImage(){
    const data = this.props.data || {"filename":"","path":"","type":"dir"};
    const fullPath = `data/1/image/${data.path}`;
    const s = fullPath.replace(/\/\//ig,"/");
    this.url = kServer + s;
    return <ListGroupItem>
      <Modal size="lg" isOpen={this.state.show_image} toggle={this.toggle} className={this.props.className}>
          <ModalHeader toggle={this.toggle}>{data.filename}</ModalHeader>
          <ModalBody>
            <img width="100%" src={this.url} alt={data.filename}/>
          </ModalBody>
        </Modal>
        <a href={window.location.hash || "#/"}  onClick={this.ShowImage}>
  {data.filename}</a> [<a href={window.location.hash || "#/"} onClick={this.ShowImage} >预览</a>] {" | "} [<a target="_blank" rel="noopener noreferrer" href={this.url}>下载</a>] <Badge color="primary">图片</Badge>
  {this.otherInfo(data)}
  </ListGroupItem>
  }

  renderOthrerFile(){
    const data = this.props.data;
    return <ListGroupItem><a target="_blank" rel="noopener noreferrer" href={this.url}>{data.filename}</a> [<a target="_blank" rel="noopener noreferrer" href={this.url}>下载</a>] <Badge color="success">文件</Badge>
    {this.otherInfo(data)}
    </ListGroupItem>
  }

  renderDir(){
    return <Dir {...this.props}/>
  }

  render(){
    const data = this.props.data || {"filename":"","path":"","type":"dir"};
    if(data.type === "dir") {
      return this.renderDir();
    } else {
      const filename = data.filename;
      const reg = new RegExp("(\\.png|\\.jpg|\\.gif|\\.jpeg)$","ig");
      if(reg.test(filename)) {
        return this.renderImage();
      } else {
        return this.renderOthrerFile();
      }
    }
  }
}

class Dir extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show:this.props.show || false,
      list:[],
      readme:"",
      fetched:false,
      ShowUrl:false,
      urlMap:{}
    };

    if(!this.props.data) {
      this.state.show = true;
    }

    this.onDataGet = this.onDataGet.bind(this);
    this.fetchDir = this.fetchDir.bind(this);
    this.fetchAndShow = this.fetchAndShow.bind(this);
    this.showReadme = this.showReadme.bind(this);
    this.toggleUrl = this.toggleUrl.bind(this);
//    const data = this.props.data || {"filename":"","path":"","type":"dir"};
  }

  onDataGet(data) {
    var urlMap = this.state.urlMap;
    const key = this.props.data.path;
    urlMap[key] = data;
    this.setState({urlMap:urlMap,...data});
  }

  showReadme(){
    if(this.state.readme) {
      this.refs["info"].innerHTML = marked(this.state.readme);
    } else {
      this.refs["info"].innerHTML = "";
    }
  }

  urlOf(path) {
    var b = `data/0/dir/${path}`;
    return b.replace(/\/\//ig,'/');
  }
  
  fullUrl(path) {
    return kServer + this.urlOf(path);
  }

  fetchDir() {
    const url = this.fullUrl(this.props.data.path);
    const key = this.props.data.path;
    if(this.state.urlMap[key]) {
      this.setState(this.state.urlMap[key]);
      return;
    }
    fetch(url).then(data=>data.json()).then(this.onDataGet);
  }

  componentDidMount(){
    if(this.state.show) {
      this.fetchDir();
    }
  }

  fetchAndShow(){
    this.setState({show: !this.state.show});
    this.fetchDir();
  }

  SelectAll(){
    document.execCommand("SelectAll");
    document.execCommand("Copy");
  }

  toggleUrl(){
    this.setState({ShowUrl:!this.state.ShowUrl});
  }

  OneLink(path, i){
    path = path.replace(/\/\//ig,"/");
    var name = "";
    if(path == "" || path == "/") {
      name = "home";
    } else {
      var nameList =  path.split("/");
      name = nameList[nameList.length - 1];
      if(name == ""){
        name = nameList[nameList.length - 2];
      }
    }
    return <BreadcrumbItem key={i}><Link to={path}>{name}</Link></BreadcrumbItem>
  }

  trim(s, sp) {
      var reg = new RegExp(`^${sp}+|${sp}+$`, "ig");
      return s.replace(reg,"");
      //return s.replace(/^\s+|\s+$/gm,'');
  }
  componentDidUpdate(prevProps,prevState){
    if(this.state.show && prevProps.data.path != this.props.data.path) {
      this.fetchDir();
    }
    if(prevState.readme != this.state.readme) {
      this.showReadme();
    }
  }

  render(){
    const data = this.props.data || {"filename":"","path":"","type":"dir"};
        
    var currentUrl = window.location.host+window.location.pathname+"/#/"+data.path;
    currentUrl = currentUrl.replace(/\/\//ig,"/");

    var path = data.path;
    path = this.trim(path,"/");

    const urlList = path.split("/");

    var urlListShow = [];
    var tmp = "";

    var showName = urlList.pop();

    for(var i in urlList) {
      tmp = tmp + "/" + urlList[i];
      urlListShow.push(tmp);
    }

    return (
    <ListGroupItem>
      {!this.props.isRoot && <div>
        <a href={window.location.hash || "#/"} onClick={this.fetchAndShow}>
          {data.filename} [{this.state.show?"收起":"展开"}] </a> 
          [<a  href={window.location.hash || "#/"}  onClick={this.toggleUrl}>链接</a>]
          [<Link to={"/"+path}>访问</Link>]
          {" "}<Badge color="secondary">目录</Badge>
      </div>}
      {this.props.isRoot && <div><Breadcrumb>
        {this.OneLink("/",-1)}
        {urlListShow.map(this.OneLink)}
        <BreadcrumbItem><a href={window.location.hash || "#/"}  onClick={this.toggleUrl}>{showName}</a></BreadcrumbItem> 
      </Breadcrumb> 
       </div>}
      <Modal isOpen={this.state.ShowUrl} toggle={this.toggleUrl} className={this.props.className}>
        <ModalHeader toggle={this.toggleUrl}>获取文件夹链接</ModalHeader>
        <ModalBody>
          <Input bsSize="sm" readOnly value={`http://${currentUrl}`} onClick={this.SelectAll}/>
        </ModalBody>
      </Modal>
      <div className="text-primary" ref="info" style={{display:this.state.show?"block":"none", paddingLeft:"1em"}}></div>
      {this.state.show && <DirList list={this.state.list}/>}
    </ListGroupItem>
    );
  }
}

class DirList extends Component {
  OneLine(data, i) {
    if(data.filename === "cache.json") {
      return "";
    }
    return <Data data={data} key={data.filename} show={false}/>;
  }

  sortFunc(a,b) {
    return b.mod_time - a.mod_time;
  }

  render(){
    const list = this.props.list;
    var list_dir = [];
    var list_file = [];

    for(var i in list) {
      if(list[i].type === "dir") {
        list_dir.push(list[i]);
      } else {
        list_file.push(list[i]);
      }
    }

    list_dir.sort(this.sortFunc);
    list_file.sort(this.sortFunc);

   return <ListGroup>
    {list_dir.map(this.OneLine)}
    {list_file.map(this.OneLine)}
    </ListGroup> ;
  }
}

class Root extends Component {
  render(){
    const path = window.location.hash;
    const path2 = path.replace("#","") || "/";
    const path3 = decodeURI(path2);
    const data = {
      path:path3,
      filename: path3,
      type:"dir"
    }
    return <Data show={true} data={data} isRoot={true}/>;
  }
}

class App extends Component {
  render() {
    return (
      <Router>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/bootswatch/4.3.1/flatly/bootstrap.min.css" rel="stylesheet" />
      <Container>
      <Row>
        <Col lg={12}>
        <div style={{height:"1em"}}></div>
          <Route path="/" component={Root}/>
          <hr/>
         <div style={{height:"3em",textAlign:"center"}}>
        </div>
        </Col>
      </Row>
      </Container>
      </Router>
    );
  }
}

export default App;
