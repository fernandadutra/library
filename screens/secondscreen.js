import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import database from "../config";
import firebase from "firebase";
import { ListItem, Icon } from "react-native-elements";

export default class Secondscreen extends Component {
  constructor() {
    super();
    this.state = {
      alltransactions: [],
      searchText: "",
      lasttransaction: "",
    };
  }
  gettransactions = async () => {
    await database
      .collection("transactions")
      .get()
      .then((snapshot) => {
        snapshot.docs.map((doc) => {
          this.setState({
            alltransactions: [...this.state.alltransactions, doc.data()],
            lasttransaction: doc,
          });
        });
      });
  };
  componentDidMount() {
    this.gettransactions();
  }
  renderitem = ({ item, i }) => {
    var date = item.date .toDate() .toString() .split(" ") .splice(0, 4) .join(" ");
    var transactiontype =
      item.transaction_type == "issue" ? "entregue" : "devolvido";
    return (
      <View style={{ borderWidth: 1 }}>
        <ListItem bottonDivider key={i}>
          <Icon type={"antdesign"} name={"book"} size={40}></Icon>
          <ListItem.Content>
            <ListItem.Title style={styles.title}>
              {`${item.book_name} ( ${item.book_id})`}
            </ListItem.Title>
            <ListItem.Subtitle style={styles.subtitle}>
              {`Este livro foi ${transactiontype} por ${item.student_name}`}
            </ListItem.Subtitle>
            <View style={styles.lowerLeftContainer}>
              <View style={styles.transactionContainer}>
                <Text
                  style={[
                    styles.transactionText,
                    {
                      color:
                        item.transaction_type == "issue" ? "green" : "blue",
                    },
                  ]}
                >
                  {item.transaction_type.charAt(0).toUpperCase() +
                    item.transaction_type.slice(1)}
                </Text>
                <Icon
                  type={"ionicon"}
                  name={
                    item.transaction_type == "issue"
                      ? "checkmark-circle-outline"
                      : "arrow-redo-circle-outline"
                  }
                  color={item.transaction_type == "issue" ? "green" : "blue"}
                ></Icon>
              </View>
              <Text style={styles.date}>{date}</Text>
            </View>
          </ListItem.Content>
        </ListItem>
      </View>
    );
  };
  handleSearch = async (text) => {
    var entertext = text.split("");
    this.setState({ alltransactions: [] });
    if (!text) {
      this.gettransactions();
    }
    if (entertext[0] == "b") {
      await database
        .collection("transactions")
        .where("book_id", "==", text)
        .get()
        .then((snapshot) => {
          snapshot.docs.map((doc) => {
            this.setState({
              alltransactions: [...this.state.alltransactions, doc.data()],
            });
          });
        });
    } else if (entertext[0] == "s") {
      await database
        .collection("transactions")
        .where("student_id", "==", text)
        .get()
        .then((snapshot) => {
          snapshot.docs.map((doc) => {
            this.setState({
              alltransactions: [...this.state.alltransactions, doc.data()],
            });
          });
        });
    }
  };
  getmoretransactions = async (text) => {
    var entertext = text.split("");
    const { lasttransaction, alltransactions } = this.state;
    if (entertext[0] == "b") {
       await database
        .collection("transactions")
        .where("book_id", "==", text)
        .startAfter(lasttransaction)
        .limit(10)
        .get()
        .then((snapshot) => {
          snapshot.docs.map((doc) => {
            this.setState({
              alltransactions: [...this.state.alltransactions, doc.data()],
              lasttransaction: doc,
            });
          });
        });
    } else if (entertext[0] == "s") {
      await database
        .collection("transactions")
        .where("student_id", "==", text)
        .startAfter(lasttransaction)
        .limit(10)
        .get()
        .then((snapshot) => {
          snapshot.docs.map((doc) => {
            this.setState({
              alltransactions: [...this.state.alltransactions, doc.data()],
              lasttransaction: doc,
            });
          });
        });
    }
  };
  render() {
    const { alltransactions, searchText } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.upperContainer}>
          <View style={styles.textinputContainer}>
            <TextInput
              style={styles.textinput}
              onChangeText={(text) => this.setState({ searchText: text })}
              placeholder={"Escreva aqui"}
              placeholderTextColor={"#FFFFFF"}
            />
            <TouchableOpacity
              style={styles.scanbutton}
              onPress={() => this.handleSearch(searchText)}
            >
              <Text style={styles.scanbuttonText}>Pesquisa</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.lowerContainer}>
          <FlatList
            data={alltransactions}
            keyExtractor={(item, index) => index.toString()}
            renderItem={this.renderitem}
            onEndReachedThreshold={0.8}
            onEndReached={() => this.getmoretransactions(searchText)}
          ></FlatList>
        </View>
      </View>
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
  lowerContainer: { flex: 0.8, backgroundColor: "#FFFFFF" },
  title: { fontSize: 20, fontFamily: "Rajdhani_500Medium" },
  subtitle: { fontSize: 16, fontFamily: "Rajdhani_500Medium" },
  lowerLeftContainer: { alignSelf: "flex-end", marginTop: -40 },
  transactionContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  transactionText: { fontSize: 20, fontFamily: "Rajdhani_500Medium" },
  date: { fontSize: 12, fontFamily: "Rajdhani_500Medium", paddingTop: 5 },
  upperContainer: { flex: 0.2, justifyContent: "center", alignItems: "center" },
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
  scanbutton: {
    width: 100,
    height: 50,
    backgroundColor: "#9DFD24",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  scanbuttonText: {
    fontSize: 24,
    color: "#0A0101",
    fontFamily: "Rajdhani_500Medium",
  },
});
