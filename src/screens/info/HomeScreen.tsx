import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState, useEffect, useContext } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import Icon from "@/src/components/Icon";
import { RootStackParamList } from "../../types/navigation";
import { type Info } from "../../types/info";
import { type User } from "../../types/user";
import { auth, db } from "../../config";
import FloatingButton from "../../components/FloatingButton";
// import { UserContext } from "../../contexts/userContext";
import { InfoListItem } from "../../components/listitem/InfoListItem";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { IconButton } from "@/src/components/IconButton";
import { UsersContext } from "@/src/contexts/usersContext";

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "Information">;
};

export const HomeScreen = ({ navigation }: Props) => {
  const ADMIN = process.env.EXPO_PUBLIC_ADMIN_A;
  const [infos, setInfos] = useState<Info[]>([]);
  const { setUsers } = useContext(UsersContext);

  useEffect(() => {
    if (auth.currentUser === null) {
      return;
    }
    navigation.setOptions({
      headerTintColor: "#800",
      title: "NHN 週報",
    });
  }, []);

  useEffect(() => {
    const q = query(collection(db, "infos"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const resultInfos: Info[] = [];
        snapshot.forEach((doc) => {
          const { desc, imgURL, uid, likes, createdAt, read } =
            doc.data() as Info;
          resultInfos.push({
            id: doc.id,
            desc,
            imgURL,
            uid,
            likes,
            createdAt,
            read,
          });
        });
        setInfos(resultInfos);
      },
      (error) => {
        // console.log("onSnapshot at Home", error);
      }
    );
    return () => {
      unsubscribe(); // ← 追加
    };
  }, [signOut]);

  useEffect(() => {
    //ログインしているユーザーuidだけをcontextに
    const ref = query(collection(db, "users"));
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const usersResults: string[] = [];
        snapshot.forEach((doc) => {
          // const { uid } = doc.data().uid;
          usersResults.push(doc.data().uid);
        });
        setUsers(usersResults);
      },
      (error) => {
        console.log("onSnapshot at AddMem", error);
      }
    );
    return () => {
      unsubscribe(); // ← 追加
    };
  }, []);

  const onPressInfo = (info: Info) => {
    navigation.navigate("InfoDetail", { info });
  };

  const onPressCreate = () => {
    navigation.navigate("InfoCreate");
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={infos}
        renderItem={({ item }: { item: Info }) => (
          <InfoListItem info={item} onPress={() => onPressInfo(item)} />
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      {ADMIN?.includes(auth.currentUser?.uid ?? "") ? (
        //新規インフォメーション作成
        <FloatingButton
          onPress={onPressCreate}
          style={{ position: "absolute", right: 30, bottom: 50 }}
        >
          <Icon name="addfile" size={25} color="white" />
        </FloatingButton>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});
