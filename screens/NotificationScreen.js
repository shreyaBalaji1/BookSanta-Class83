import React, { Component } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList } from 'react-native';
import firebase from "firebase";
import db from "../config";
import {ListItem, Icon} from "react-native-elements";
import MyHeader from '../components/MyHeader';

export default class NotificationScreen extends Component {
    constructor(){
        super();
        this.state = {
            userId: firebase.auth().currentUser.email,
            allNotifications: []
        };
        this.requestRef = null;
    }
    
    getNotifications = () => {
        this.requestRef = db.collection("all_notifications").where("notification_status", "==", "unread")
        .where("targeted_user_id", "==", this.state.userId)
        .onSnapshot((snapshot) =>  {
            var allNotifications = [];
            snapshot.docs.map((doc) => {
                var notification = doc.data();
                notification["doc_id"] = doc.id;
                allNotifications.push(notification);
            });
            this.setState({
                allNotifications: allNotifications
            });
        })
    }

    keyExtractor = (item, index) => index.toString()

    renderItem = ( {item, i} ) =>{
      return (
        <ListItem
          key={i}
          title={item.book_name}
          subtitle={item.message}
          titleStyle={{ color: 'black', fontWeight: 'bold' }}
          leftElement={<Icon name = "book" type = "font-awesome" color = "#696969"/>}
          bottomDivider
        />
      )
    }
    

    componentDidMount() {
        this.getNotifications();
    }

    componentWillUnmount() {
        this.requestRef();
    }

    render() {
        return(
            <View style = {{flex: 1}}>
                <MyHeader title = "Notifications" navigation = {this.props.navigation}/>
                <View>
                    {
                        this.state.allNotifications === 0 ? (
                            <View style = {{flex: 1, justifyContent: "center", alignItem: "center"}}>
                                <Text style = {{fontSize: 25}}>No Notifications Yet</Text>
                            </View>
                        ) : (
                            <FlatList
                             keyExtractor = {this.keyExtractor}
                             data = {this.state.allNotifications}
                             renderItem = {this.renderItem}
                            />
                        )
                    }
                </View>
            </View>
        );
    }
}