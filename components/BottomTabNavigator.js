import React,{Component} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Firstscreen from '../screens/firstscreen';
import Secondscreen from '../screens/secondscreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab=createBottomTabNavigator();
export default class BottomTabNavigator extends Component{
render(){
    return(
        <SafeAreaProvider>
        <NavigationContainer>
        <Tab.Navigator screenOptions={({route})=>({
        tabBarIcon:({focused,color,size})=>{
            let iconName;
            if(route.name==="Primeira tela"){
            iconName="book"
            }
            else if(route.name==="Segunda tela"){
            iconName="search"
            }
            return(
            <Ionicons 
            name={iconName}
            size={size}
            color={color}
            ></Ionicons>
            )
        }
})}
tabBarOptions={{ activeTintColor: "#FFFFFF", 
inactiveTintColor: "black", 
style: { height: 400,
 borderTopWidth: 0, 
 backgroundColor: "#5653d4" }, 
 labelStyle: { fontSize: 20, 
 fontFamily: "Rajdhani_500Medium" }, 
 labelPosition: "beside-icon", 
 tabStyle: { marginTop: 25,
  marginLeft: 0, 
  marginRight: 0, 
  borderRadius: 30, 
  borderWidth: 1, 
  alignItems: "center", 
  justifyContent: "center", 
  backgroundColor: "#5653d4" }}}>
        <Tab.Screen name='Primeira tela' component={Firstscreen}></Tab.Screen>
        <Tab.Screen name='Segunda tela' component={Secondscreen}></Tab.Screen>
        </Tab.Navigator>
        </NavigationContainer>
        </SafeAreaProvider>
 )}} 