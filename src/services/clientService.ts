import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { Client } from '../types';

const COLLECTION = 'clients';

export const addClient = async (client: Omit<Client, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...client,
    createdAt: Timestamp.now(),
    lastPurchase: client.lastPurchase || Timestamp.now()
  });
  return docRef.id;
};

export const getClients = async (userId: string): Promise<Client[]> => {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        lastPurchase: data.lastPurchase?.toDate?.() || new Date()
      } as Client;
    });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return [];
  }
};

export const updateClient = async (id: string, data: Partial<Client>) => {
  await updateDoc(doc(db, COLLECTION, id), data);
};

export const deleteClient = async (id: string) => {
  await deleteDoc(doc(db, COLLECTION, id));
};