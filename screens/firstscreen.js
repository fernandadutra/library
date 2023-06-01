import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  Image,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import * as Permissions from "expo-permissions";
import { BarCodeScanner } from "expo-barcode-scanner";
import database from "../config";
import firebase from "firebase";

const bgimg = require("../assets/background2.png");
const appname = require("../assets/appName.png");
const appicon = require("../assets/appIcon.png");

export default class Firstscreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      domState: "normal",
      hasCameraPermissions: null,
      scanned: false,
      scannedData: "",
      bookId: "",
      studentId: "",
      bookName: "",
      studentName: "",
    };
  }
  GetCameraPermission = async (domState) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      /*status === "granted" é verdadeiro se o usuário concedeu permissão status === "granted" é falso se o usuário não concedeu permissão */
      hasCameraPermissions: status === "granted",
      domState: domState,
      scanned: false,
    });
  };
  barcodescanner = async ({ type, data }) => {
    const { domState } = this.state;
    if (domState === "bookId") {
      this.setState({
        bookId: data,
        domState: "normal",
        scanned: true,
      });
    }
    if (domState === "studentId") {
      this.setState({
        studentId: data,
        domState: "normal",
        scanned: true,
      });
    }
  };

  checkbookavailability = async (bookId) => {
    const bookref = await database
      .collection("books")
      .where("book_id", "==", bookId)
      .get();
    var transactiontype = "";
    if (bookref.docs.length == 0) {
      transactiontype = false;
    } else {
      bookref.docs.map((doc) => {
        transactiontype = doc.data().is_book_available ? "issue" : "return";
      });
    }
    return transactiontype;
  };

  checkstudentforissue = async (studentId) => {
    const studentref = await database
      .collection("students")
      .where("student_id", "==", studentId)
      .get();
    var studenteligible = "";
    if (studentref.docs.length == 0) {
      studenteligible = false;
      Alert.alert("ID do aluno não encontrada no banco de dados.");
    } else {
      studentref.docs.map((doc) => {
        if (doc.data().student_number_of_books_issued < 2) {
          studenteligible = true;
        } else {
          studenteligible = false;
          Alert.alert("Aluno atingiu o limite de livros!");
        }
      });
    }
    return studenteligible;
  };

  checkstudentforreturn = async (bookId, studentId) => {
    const transactionref = await database
      .collection("transactions")
      .where("book_id", "==", bookId)
      .limit(1)
      .get();
    var studenteligible = "";
    transactionref.docs.map((doc) => {
      var lastbooktransaction = doc.data();
      if (lastbooktransaction.student_id == studentId) {
        studenteligible = true;
      } else {
        studenteligible = false;
        Alert.alert("Esse livro não foi retirado por este aluno.");
      }
    });
    return studenteligible;
  };

  handletransaction = async () => {
    const { bookId, studentId } = this.state;
    this.getbookdetails(bookId);
    this.getstudentdetails(studentId);
    var transactiontype = await this.checkbookavailability(bookId);
    console.log(transactiontype);
    if (transactiontype == "issue") {
      var iseligible = await this.checkstudentforissue(studentId);
      if (iseligible == true) {
        const { bookName, studentName } = this.state;
        this.initiatebookissue(bookId, studentId, bookName, studentName);
        Alert.alert("Livro entregue para o aluno!");
      }
    } else if (transactiontype == "return") {
      var iseligible = await this.checkstudentforreturn(bookId, studentId);
      if (iseligible == true) {
        const { bookName, studentName } = this.state;
        this.initiatebookreturn(bookId, studentId, bookName, studentName);
        Alert.alert("Livro devolvido para a biblioteca!");
      }
    } else if (transactiontype == false) {
      Alert.alert("Livro não está disponível no momento.");
    }
  };

  getbookdetails = (bookId) => {
    bookId = bookId.trim();
    database
      .collection("books")
      .where("book_id", "==", bookId)
      .get()
      .then((snapshot) => {
        snapshot.docs.map((doc) => {
          this.setState({
            bookName: doc.data().book_name,
          });
        });
      });
  };

  getstudentdetails = (studentId) => {
    studentId = studentId.trim();
    database
      .collection("students")
      .where("student_id", "==", studentId)
      .get()
      .then((snapshot) => {
        snapshot.docs.map((doc) => {
          this.setState({
            studentName: doc.data().student_name,
          });
        });
      });
  };

  initiatebookissue = (bookId, studentId, bookName, studentName) => {
    //adicionar uma transação nova
    database.collection("transactions").add({
      student_id: studentId,
      student_name: studentName,
      book_id: bookId,
      book_name: bookName,
      date: firebase.firestore.Timestamp.now().toDate(),
      transaction_type: "issue",
    });
    //alterando o status do livro
    database.collection("books").doc(bookId).update({
      is_book_available: false,
    });
    //alterando o número de livros retirado pelo aluno
    database
      .collection("students")
      .doc(studentId)
      .update({
        student_number_of_books_issued:
          firebase.firestore.FieldValue.increment(1),
      });
    //atualizando as variaveis do local
    this.setState({ bookId: "", studentId: "" });

    console.log("livro retirado pelo aluno");
  };

  initiatebookreturn = (bookId, studentId, bookName, studentName) => {
    //adicionar uma transação nova
    database.collection("transactions").add({
      student_id: studentId,
      student_name: studentName,
      book_id: bookId,
      book_name: bookName,
      date: firebase.firestore.Timestamp.now().toDate(),
      transaction_type: "return",
    });
    //alterando o status do livro
    database.collection("books").doc(bookId).update({
      is_book_available: true,
    });
    //alterando o número de livros retirado pelo aluno
    database
      .collection("students")
      .doc(studentId)
      .update({
        student_number_of_books_issued:
          firebase.firestore.FieldValue.increment(-1),
      });
    //atualizando as variaveis do local
    this.setState({ bookId: "", studentId: "" });
    console.log(" livro devolvido pelo aluno");
  };

  render() {
    const {
      domState,
      hasCameraPermissions,
      scanned,
      scannedData,
      bookId,
      studentId,
    } = this.state;
    if (domState !== "normal") {
      return (
        <BarCodeScanner
          style={StyleSheet.absoluteFillObject}
          onBarCodeScanned={scanned ? undefined : this.barcodescanner}
        ></BarCodeScanner>
      );
    }
    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <ImageBackground source={bgimg} style={styles.bgImage}>
          <View style={styles.upperContainer}>
            <Image source={appicon} style={styles.appIcon}></Image>
            <Image source={appname} style={styles.appName}></Image>
          </View>
          <View style={styles.lowerContainer}>
            <View style={styles.textinputContainer}>
              <TextInput
                placeholder={"ID do livro"}
                placeholderTextColor={"white"}
                value={bookId}
                onChangeText={(text) => this.setState({ bookId: text })}
                style={styles.textinput}
              ></TextInput>
              <TouchableOpacity
                onPress={() => this.GetCameraPermission("bookId")}
                style={styles.scanbutton}
              >
                <Text style={styles.buttonText}>Digitalizar</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.textinputContainer, { marginTop: 25 }]}>
              <TextInput
                placeholder={"ID do usuário"}
                placeholderTextColor={"white"}
                value={studentId}
                onChangeText={(text) => this.setState({ studentId: text })}
                style={styles.textinput}
              ></TextInput>
              <TouchableOpacity
                onPress={() => this.GetCameraPermission("studentId")}
                style={styles.scanbutton}
              >
                <Text style={styles.buttonText}>Digitalizar</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.button, { marginTop: 25 }]}
              onPress={this.handletransaction}
            >
              <Text style={styles.buttonText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#5653D4",
  },
  text: {
    color: "#ffff",
    fontSize: 30,
  },
  textinputContainer: {
    borderWidth: 2,
    borderRadius: 10,
    flexDirection: "row",
    backgroundColor: "#9DFD24",
    borderColor: "#FFFFFF",
  },

  textinput: {
    width: "57%",
    height: 50,
    padding: 10,
    borderColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 3,
    fontSize: 18,
    backgroundColor: "#5653D4",
    fontFamily: "Rajdhani_500Medium",
    color: "#FFFFFF",
  },

  button: {
    width: "43%",
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F48D20",
    borderRadius: 15,
  },

  buttonText: {
    fontSize: 24,
    color: "#FFFFFF",
    fontFamily: "Rajdhani_500Medium",
  },

  bgImage: { flex: 1, resizeMode: "cover", justifyContent: "center" },

  appIcon: { width: 200, height: 200, resizeMode: "contain", marginTop: 80 },

  appName: { width: 180, resizeMode: "contain" },

  upperContainer: { flex: 0.5, justifyContent: "center", alignItems: "center" },

  lowerContainer: { flex: 0.5, alignItems: "center" },

  scanbutton: {
    width: 100,
    height: 50,
    backgroundColor: "#9DFD24",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
