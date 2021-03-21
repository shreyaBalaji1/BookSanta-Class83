import React, { Component } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList } from 'react-native';
import firebase from "firebase";
import db from "../config";
import {ListItem, Icon} from "react-native-elements";
import MyHeader from '../components/MyHeader';

export default class MyDonationsScreen extends Component {
    constructor() {
        super();
        this.state = {
            userId: firebase.auth().currentUser.email,
            allDonations: [],
            donorName: ""
        }
        this.requestRef = null;
    }

    getDonorDetails = (donorId) => {
        db.collection('users').where("email_id", "==", donorId).get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                this.setState({
                    donorName: doc.data().first_name + " " + doc.data().last_name
                });
            });
        })
    }
    getAllDonations = () => {
        this.requestRef = db.collection("all_donations").where("donor_id", "==", this.state.userId)
        .onSnapshot((snapshot) =>  {
            var allDonations = snapshot.docs.map(doc => doc.data());
            this.setState({
                allDonations: allDonations
            });
        })
    }

    keyExtractor = (item, index) => index.toString()

    renderItem = ( {item, i} ) =>{
      return (
        <ListItem
          key={i}
          title={item.book_name}
          subtitle={"Requested By: " + item.requested_by + "\nStatus: " + item.request_status }
          titleStyle={{ color: 'black', fontWeight: 'bold' }}
          rightElement={
              <TouchableOpacity style={[styles.button, {
                  backgroundColor: item.request_status === "Book Sent" ? "green" : "#ff5722"
              }]} onPress = {() => {
                this.sendBook(item);
              }}>
                <Text style={{color:'#ffff'}}>{
                item.request_status === "Book Sent" ? "Book Sent" : "Send Book"}</Text>
              </TouchableOpacity>
            }
          leftElement={<Icon name = "book" type = "font-awesome" color = "#696969"/>}
          bottomDivider
        />
      )
    }
    
    componentDidMount() {
        this.getAllDonations();
        this.getDonorDetails(this.state.userId);
    }

    componentWillMount() {
        this.requestRef();
    }

    sendNotification = (bookDetails, requestStatus) => {
        var requestId = bookDetails.request_id;
        var donorId = bookDetails.donor_id;
        db.collection("all_notifications")
        .where("request_id", "==", requestId).where("donor_id", "==", donorId).get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
              var message = "";
                if(requestStatus === "Book Sent") {
                    message = this.state.donorName + "has sent you your requested book."
                }
                else {
                    message = this.state.donorName + "has shown interest in donating the book."
                }
                db.collection("all_notifications").doc(doc.id).update({
                    message:               message,
                    notification_status:  "unread",
                    date:                 firebase.firestore.FieldValue.currentUser.email
                    
                  });
            });
        })
    }

    sendBook = (bookDetails) => {
        if(bookDetails.request_status === "Book Sent") {
          var requestStatus = "Donor Interested";
            db.collection("all_donations").doc(bookDetails.doc_id).update({
                request_status: "Donor Interested"
            });
            this.sendNotification(bookDetails, requestStatus);
        }
        else {
            var requestStatus = "Book Sent";
            db.collection("all_donations").doc(bookDetails.doc_id).update({
                request_status: "Book Sent"
            });
            this.sendNotification(bookDetails, requestStatus);
        }
    }

    render() {
        return(
           <View style = {{flex: 1}}>
               <MyHeader title = "My Donations" navigation = {this.props.navigation}/>
               <View>
                   {
                       this.state.allDonations === 0 ? (
                           <View style = {styles.subtitle}>
                               <Text style = {{fontSize: 20}}>No Donations Yet</Text>
                           </View>
                       ) : (
                           <FlatList
                            keyExtractor = {this.keyExtractor}
                            data = {this.state.allDonations}
                            renderItem = {this.renderItem}
                           />
                       )
                   }
               </View>
           </View>
        );
    }
}

const styles = StyleSheet.create({
    button:{
      width:100,
      height:30,
      justifyContent:'center',
      alignItems:'center',
      backgroundColor:"#ff5722",
      shadowColor: "#000",
      shadowOffset: {
         width: 0,
         height: 8
       },
      elevation : 16
    },
    subtitle :{
      flex:1,
      fontSize: 20,
      justifyContent:'center',
      alignItems:'center'
    }
  })