import React, { useState, useCallback, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { UserData } from './../types/UserDataType';
import { notify } from '../constants/Notify';
import { db } from '../firebase';
import { deleteAccountUrl } from '../constants/authApiData';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { Friend } from '../types/FriendType';
import { getFullDate } from '../constants/FullDate';

type AuthContextType = {
  token: string;
  initialData: Partial<UserData>;
  isLoggedIn: boolean;
  loginUser: (token: string, userData: Partial<UserData>) => void;
  registerUser: (userData: Partial<UserData>, token: string) => void;
  logout: () => void;
  update: (id: string, userData: Partial<UserData>) => void;
  deleteData: (id: string) => void;
  addToFriends: (userData: Friend) => void;
  removeFromFriends: (userData: Friend) => void;
};

export const AuthContext = React.createContext<AuthContextType>({
  token: '',
  initialData: {},
  isLoggedIn: false,
  loginUser: () => {},
  registerUser: () => {},
  logout: () => {},
  update: () => {},
  deleteData: () => {},
  addToFriends: () => {},
  removeFromFriends: () => {},
});

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [initialData, setInitialData] = useState<Partial<UserData>>({});
  const [token, setToken] = useState('');
  const userIsLoggedIn = !!token;
  const storage = getStorage();

  const loginHandler = useCallback(
	async (token: string, userData: Partial<UserData>) => {
	  const q = query(collection(db, 'users'), where('email', '==', userData.email));
  
	  try {
		const querySnapshot = await getDocs(q);
		querySnapshot.forEach(async (s) => {
		  await updateDoc(doc(db, 'users', s.id), { lastLogin: getFullDate().fullDate });
		  setInitialData(s.data() as UserData);
		  const nickname = s.data()?.nickname || '';
		  localStorage.setItem('nickname', nickname);
		  console.log(userData.nick)
		});
  
		console.log(userData.email);
		setToken(token);
		notify('Successfully logged in!');
	  } catch (err) {
		console.log(err);
	  }
	},
	[]
  );


  useEffect(() => {
    if (initialData.id) {
      // If user data exists, update it in the Firestore collection
      updateHandler(initialData.id, initialData);
    } else {
      // If user data doesn't exist, create a new document in the Firestore collection
      const createNewUser = async () => {
        try {
          const newUserRef = await addDoc(collection(db, 'users'), initialData);
          setInitialData({ ...initialData, id: newUserRef.id });
        } catch (err) {
          console.log(err);
        }
      };
      createNewUser();
    }
  }, [initialData]);

  const registerHandler = useCallback(
    async (userData: Partial<UserData>, token: string) => {
      setInitialData(userData);
      setToken(token);
      notify('You are successfully registered!');
    },
    []
  );

const logoutHandler = () => {
  localStorage.removeItem('nickname');
  setToken('');
  setInitialData({});
  notify('You have been logged out');
};


  const updateHandler = useCallback(
    async (id: string, userData: Partial<UserData>) => {
      await updateDoc(doc(db, 'users', id), userData);
    },
    []
  );

  const deleteAccountHandler = useCallback(
    async (id: string) => {
      const desertRef = ref(storage, `${initialData.email}/profile`);

      try {
        await deleteDoc(doc(db, 'users', id));
        await deleteObject(desertRef);

        const res = await fetch(deleteAccountUrl, {
          method: 'POST',
          body: JSON.stringify({ idToken: token }),
          headers: {
            'Content-type': 'application/json',
          },
        });

        if (res.ok) {
          logoutHandler();
        }
      } catch (err) {
        console.log(err);
      }
    },
    [initialData.email, storage, token, logoutHandler]
  );

  const addToFriendsHandler = useCallback(
    async (userData: Friend) => {
      const userRef = doc(db, 'users', initialData.id as string);

      try {
        await updateDoc(userRef, {
          friends: arrayUnion(userData),
        });
        notify('Added a friend!');
      } catch (err) {
        console.log(err);
      }
    },
    [initialData.id]
  );

  const removeFromFriendsHandler = useCallback(
    async (userData: Friend) => {
      const userRef = doc(db, 'users', initialData.id as string);
      try {
        await updateDoc(userRef, {
          friends: arrayRemove(userData),
        });
        notify('Removed a friend!');
      } catch (err) {
        console.log(err);
      }
    },
    [initialData.id]
  );

  const contextValue = {
    token: token,
    initialData: initialData,
    isLoggedIn: userIsLoggedIn,
    loginUser: loginHandler,
    registerUser: registerHandler,
    logout: logoutHandler,
    update: updateHandler,
    deleteData: deleteAccountHandler,
    addToFriends: addToFriendsHandler,
    removeFromFriends: removeFromFriendsHandler,
  };
  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
