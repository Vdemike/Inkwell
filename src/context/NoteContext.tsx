import React, { useState, useEffect, useCallback } from 'react';
import { Note } from '../types/NoteType';
import { notify } from '../constants/Notify';
import { collection, addDoc, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

type NotesContextType = {
  notes: Note[];
  trashNotes: Note[];
  favouriteNotes: Note[];
  addNote: (noteObj: Note) => void;
  removeNote: (id: string, noteObj: Note) => void;
  removeFavourite: (noteObj: Note) => void;
  updateNote: (noteObj: Note) => void;
  permRemove: (id: string) => void;
  undoNote: (id: string, noteObj: Note) => void;
  removeAll: () => void;
  clearTrash: () => void;
};

export const NotesContext = React.createContext<NotesContextType>({
  notes: [],
  favouriteNotes: [],
  trashNotes: [],
  addNote: () => {},
  removeNote: () => {},
  removeFavourite: () => {},
  updateNote: () => {},
  permRemove: () => {},
  undoNote: () => {},
  removeAll: () => {},
  clearTrash: () => {},
});

export const NotesContextProvider = ({ children }: { children: JSX.Element }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [trashNotes, setTrashNotes] = useState<Note[]>([]);
  const [favouriteNotes, setFavouriteNotes] = useState<Note[]>([]);

  const fetchNotes = async () => {
    const notesCollection = collection(db, 'notes');
    const trashNotesCollection = collection(db, 'trashNotes');

    const notesSnapshot = await getDocs(notesCollection);
    const trashNotesSnapshot = await getDocs(trashNotesCollection);

	const notesData: Note[] = notesSnapshot.docs.map((doc) => ({
		id: doc.id,
		author: doc.data().author,
		title: doc.data().title, // Replace with the actual property names
		category: doc.data().category,
		description: doc.data().description,
		favourite: doc.data().favourite,
		publish: doc.data().publish,
		descLength: doc.data().descLength,
		editHistory: doc.data().editHistory,
	  }));
	  
	  const trashNotesData: Note[] = trashNotesSnapshot.docs.map((doc) => ({
		id: doc.id,
		author: doc.data().author,
		title: doc.data().title, // Replace with the actual property names
		category: doc.data().category,
		description: doc.data().description,
		favourite: doc.data().favourite,
		publish: doc.data().publish,
		descLength: doc.data().descLength,
		editHistory: doc.data().editHistory,
	  }));
	  
	  setNotes(notesData);
	  setTrashNotes(trashNotesData);
	  
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const addNoteHandler = useCallback(
	async (noteObj: Note) => {
	  try {
		const { author, ...restNoteObj } = noteObj; // Destructure the author field from noteObj
		const updatedNoteObj = {
		  author: author || 'Unknown', // Assign a default value if author is missing or undefined
		  ...restNoteObj,
		};
		const newNoteRef = await addDoc(collection(db, 'notes'), updatedNoteObj);
		const newNote = { id: newNoteRef.id, ...updatedNoteObj };
		setNotes((prevNotes) => [newNote, ...prevNotes]);
		notify('Added new note');
	  } catch (err) {
		console.log(err);
	  }
	},
	[]
  );
  

  const removeFromFavourite = useCallback(
    async (noteObj: Note) => {
      try {
        const noteRef = doc(db, 'notes', noteObj.id);
        await deleteDoc(noteRef);
        const oldNotes = notes.filter((note) => note.id !== noteObj.id);
        setNotes([noteObj, ...oldNotes]);
        notify('Note is unfavourited');
      } catch (err) {
        console.log(err);
      }
    },
    [notes]
  );

  const pushNotesToFavouriteHandler = useCallback(() => {
    const filteredFavouriteNotes = notes.filter((note) => note.favourite === true);
    setFavouriteNotes(filteredFavouriteNotes);
  }, [notes]);

  useEffect(() => {
    pushNotesToFavouriteHandler();
  }, [pushNotesToFavouriteHandler]);

  const updateNote = async (noteObj: Note) => {
	try {
	  const noteRef = doc(db, 'notes', noteObj.id);
	  await setDoc(noteRef, noteObj);
	  const oldNotes = notes.filter((note) => note.id !== noteObj.id);
	  setNotes([noteObj, ...oldNotes]);
	  notify('Note is saved');
	} catch (err) {
	  console.log(err);
	}
  };

  const undoNoteHandler = useCallback(
    async (id: string, noteObj: Note) => {
      try {
        const noteRef = doc(db, 'trashNotes', id);
        await deleteDoc(noteRef);
        const newNotes: Note[] = trashNotes.filter((note) => note.id !== id);
        const newNote = noteObj;
        setNotes((prevNotes) => [...prevNotes, newNote]);
        setTrashNotes(newNotes);
        notify('Note has been withdrawn');
      } catch (err) {
        console.log(err);
      }
    },
    [trashNotes]
  );

  const removeNoteHandler = useCallback(
    async (id: string, noteObj: Note) => {
      try {
        const noteRef = doc(db, 'notes', id);
        await deleteDoc(noteRef);
        const newNotes: Note[] = notes.filter((note) => note.id !== id);
        const newTrashNote = noteObj;
        setNotes(newNotes);
        setTrashNotes((prevNotes) => [...prevNotes, newTrashNote]);
        notify('Note is trashed');
      } catch (err) {
        console.log(err);
      }
    },
    [notes]
  );

  const permDeleteNote = async (id: string) => {
    try {
      const noteRef = doc(db, 'trashNotes', id);
      await deleteDoc(noteRef);
      const newNotes: Note[] = trashNotes.filter((note) => note.id !== id);
      setTrashNotes(newNotes);
      notify('Note is deleted');
    } catch (err) {
      console.log(err);
    }
  };

  const removeAllNotes = async () => {
    try {
      for (const note of notes) {
        const noteRef = doc(db, 'notes', note.id);
        await deleteDoc(noteRef);
      }

      const prevNotes = [...notes, ...trashNotes];
      setTrashNotes(prevNotes);
      notify('Trashed all notes');
      setNotes([]);
    } catch (err) {
      console.log(err);
    }
  };

  const removeAllTrashNotes = async () => {
    try {
      for (const note of trashNotes) {
        const noteRef = doc(db, 'trashNotes', note.id);
        await deleteDoc(noteRef);
      }

      setTrashNotes([]);
      notify('Deleted all notes');
    } catch (err) {
      console.log(err);
    }
  };

  const contextValue: NotesContextType = {
    notes: notes,
    trashNotes: trashNotes,
    favouriteNotes: favouriteNotes,
    addNote: addNoteHandler,
    updateNote: updateNote,
    removeNote: removeNoteHandler,
    removeFavourite: removeFromFavourite,
    permRemove: permDeleteNote,
    undoNote: undoNoteHandler,
    removeAll: removeAllNotes,
    clearTrash: removeAllTrashNotes,
  };

  return <NotesContext.Provider value={contextValue}>{children}</NotesContext.Provider>;
};
