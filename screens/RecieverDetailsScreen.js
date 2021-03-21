import React, { Component } from 'react';
import { View, StyleSheet, Text, Alert, TextInput, TouchableOpacity } from 'react-native';
import firebase from "firebase";
import db from "../config";
import {Card, Header, Icon} from "react-native-elements";


export default class RecieverDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userId: firebase.auth().currentUser.email,
            recieverId: this.props.navigation.getParam("details")["user_id"],
            requestId: this.props.navigation.getParam("details")["request_id"],
            bookName: this.props.navigation.getParam("details")["book_name"],
            reasonToRequest: this.props.navigation.getParam("details")["reason_to_request"],
            recieverName: "",
            recieverContact: "",
            recieverAddress: "",
            recieverRequestDocId: ""
        }
    }

    getRecieverDetails() {
        db.collection("users").where("email_id", "==", this.state.recieverId).get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                this.setState({
                    recieverName: doc.data().first_name,
                    recieverContact: doc.data().contact,
                    recieverAddress: doc.data().address    
                });
            });
        });
        db.collection("requested_books").where("request_id", "==", this.state.requestId).get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                this.setState({
                    recieverRequestDocId: doc.id
                });
            });
        });
        
    }
    
    updateBookStatus = () => {
        db.collection("all_donations").add({
            book_name: this.state.bookName,
            requested_by: this.state.recieverName,
            request_id: this.state.requestId,
            donor_id: this.state.userId,
            request_status: "Donor Interested"
        })
    }

    addNotification = () => {
        var message = this.state.userName + "has shown interest in donating a book.";
        db.collection("all_notifications").add({
            targeted_user_id: this.state.recieverId,
            donor_id: this.state.userId,
            request_id: this.state.requestId,
            book_name: this.state.bookName,
            date: firebase.firestore.FieldValue.serverTimestamp(),
            message: message,
            notification_status: "unread"
        })
    }

    render() {
        return(
            <View>
                <View>
                    <Header
                    leftComponent = 
                    {<Icon
                    name = "arrow-left"
                    type = "feather"
                    color = "#696969"/>}
                    centerComponent = {{text: "Donate Books", style: {color: "#90a5a9", fontSize: 20, fontWeight: "bold"}}}
                    backgroundColor = "#eaf8fe"/>
                </View>
                <View style = {{flex: 0.3}}>
                    <Card title = "Book Information" titleStyle = {{fontSize: 20}}>
                        <Card>
                            <Text style = {{fontWeight: 'bold'}}>Name: {this.state.bookName}</Text>
                        </Card>
                        <Card>
                            <Text style = {{fontWeight: 'bold'}}>Reason: {this.state.reasonToRequest}</Text>
                        </Card>
                    </Card>
                </View>
                <View style = {{flex: 0.3}}>
                    <Card title = "Reciever Information" titleStyle = {{fontSize: 20}}>
                        <Card>
                            <Text style = {{fontWeight: 'bold'}}>Name: {this.state.recieverName}</Text>
                        </Card>
                        <Card>
                            <Text style = {{fontWeight: 'bold'}}>Contact: {this.state.recieverContact}</Text>
                        </Card>
                        <Card>
                            <Text style = {{fontWeight: 'bold'}}>Address: {this.state.recieverAddress}</Text>
                        </Card>
                    </Card>
                </View>
                <View style = {styles.buttonContainer}>
                    {
                        this.state.recieverId !== this.state.userId ? (
                            <TouchableOpacity style = {styles.button} onPress = {() => {
                                this.updateBookStatus();
                                this.addNotification();
                                this.props.navigation.navigate("MyDonations")
                            }}>
                                <Text>I Want To Donate</Text>
                            </TouchableOpacity>
                        ) : null
                    }
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    buttonContainer: {
        flex:0.3,
        justifyContent:'center',
        alignItems:'center'
    },
    button: {
        width:200,
        height:50,
        justifyContent:'center',
        alignItems : 'center',
        borderRadius: 10,
        backgroundColor: 'orange',
        shadowColor: "#000",
        shadowOffset: {
           width: 0,
           height: 8
         },
        elevation : 16
    }
});