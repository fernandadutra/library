import React,{Component} from 'react';
import * as Font from 'expo-font';
import {Rajdhani_500Medium} from '@expo-google-fonts/rajdhani';
import BottomTabNavigator from './components/BottomTabNavigator';


export default class App extends Component{
  constructor(){
    super();
    this.state={fontloaded:false}
  }
  async loadfonts(){
  await Font.loadAsync({Rajdhani_500Medium:Rajdhani_500Medium})
  this.setState({fontloaded:true})
  }
  componentDidMount(){
  this.loadfonts();
  }
  render(){
  const{fontloaded}=this.state
  if(fontloaded){
    return(
     <BottomTabNavigator></BottomTabNavigator>
      )}
      return null 
    }
  }
  