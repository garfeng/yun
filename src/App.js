import React, { Component } from 'react';
import {HashRouter as Router, Route, Link}  from 'react-router-dom';
import  {fetchUrl} from 'fetch';
import './App.css';
import  sha1 from 'sha1';
import  marked from 'marked';

import {ListGroup, ListGroupItem,Modal,ModalHeader,ModalBody, Badge,Container,Row,Col,Button } from 'reactstrap';

const kServer = "https://garfeng.net/";

function urlOf(path) {
  const timecode = Math.floor(new Date().getTime() / 1000);
  const timecode_s = timecode.toString(10);
  const s = path.replace(/\//ig,"");
  const h = sha1(timecode_s+s);
  return `data/${timecode_s}/${h}/${path}`;
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

  renderImage(){
    const data = this.props.data || {"filename":"","path":"","type":"dir"};

    return <ListGroupItem>
      <Modal size="lg" isOpen={this.state.show_image} toggle={this.toggle} className={this.props.className}>
          <ModalHeader toggle={this.toggle}>{data.filename}</ModalHeader>
          <ModalBody>
            <img width="100%" src={this.url} />
          </ModalBody>
        </Modal>
        <a onClick={this.ShowImage}>
  {data.filename}</a> [<a onClick={this.ShowImage}>预览</a>] {" | "} [<a target="_blank" href={this.url}>下载</a>] <Badge color="primary">图片</Badge>
  </ListGroupItem>
  }

  renderOthrerFile(){
    const data = this.props.data;
    return <ListGroupItem><a target="_blank" href={this.url}>{data.filename}</a> [<a target="_blank" href={this.url}>下载</a>] <Badge color="success">文件</Badge>
    </ListGroupItem>
  }

  renderDir(){
    return <Dir {...this.props}/>
  }

  render(){
    const data = this.props.data || {"filename":"","path":"","type":"dir"};
    console.log(data);
    if(data.type == "dir") {
      return this.renderDir();
    } else {
      const filename = data.filename;
      const reg = new RegExp("(\.png|\.jpg|\.gif|\.jpeg)$","ig");
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
      fetched:false
    };

    if(!this.props.data) {
      this.state.show = true;
    }

    this.onDataGet = this.onDataGet.bind(this);
    this.fetchDir = this.fetchDir.bind(this);
    this.fetchAndShow = this.fetchAndShow.bind(this);
    this.showReadme = this.showReadme.bind(this);
    const data = this.props.data || {"filename":"","path":"","type":"dir"};
    this.url = this.fullUrl(data.path);
  }

  onDataGet(data) {
    this.setState(data);
    this.showReadme();
  }

  showReadme(){
    if(this.state.readme) {
      this.refs["info"].innerHTML = marked(this.state.readme);
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
    if(this.state.fetched) {
      this.showReadme();
      return;
    }
    this.setState({fetched:true});
    fetch(this.url).then(data=>data.json()).then(this.onDataGet);
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

  render(){
    const data = this.props.data || {"filename":"","path":"","type":"dir"};
    return (
    <ListGroupItem>
      {!this.props.isRoot && <div><a onClick={this.fetchAndShow}>{data.filename} [{this.state.show?"收起":"展开"}] </a> <Badge color="secondary">目录</Badge></div>}
      {this.props.isRoot && <div><h2>目录：{data.filename}</h2><hr/></div>}
      <div className="text-muted" ref="info" style={{display:this.state.show?"block":"none", paddingLeft:"1em"}}></div>
      {this.state.show && <DirList list={this.state.list}/>}
    </ListGroupItem>
    );
  }
}

class DirList extends Component {
  constructor(props) {
    super(props);
  }

  OneLine(data, i) {
    if(data.filename == "cache.json") {
      return "";
    }
    console.log(data);
    return <Data data={data} key={data.filename} show={false}/>;
  }

  render(){
    console.log(list);
    const list = this.props.list;
    var list_dir = [];
    var list_file = [];

    for(var i in list) {
      if(list[i].type == "dir") {
        list_dir.push(list[i]);
      } else {
        list_file.push(list[i]);
      }
    }
    return <ListGroup>
    {list_dir.map(this.OneLine)}
    {list_file.map(this.OneLine)}
    </ListGroup> ;
  }
}

class Root extends Component {
  constructor(props){
    super(props);
  }

  render(){
    const path = window.location.hash;
    const path2 = path.replace("#","") || "/";
    console.log(path2);
    const data = {
      path:path2,
      filename: path2,
      type:"dir"
    }
    return <Data show={true} data={data} isRoot={true}/>;
  }
}

class App extends Component {
  render() {
    return (
      <Container>
      <Row>
        <Col lg={12}>
          <Root />
        </Col>
      </Row>
      </Container>
    );
  }
}

export default App;