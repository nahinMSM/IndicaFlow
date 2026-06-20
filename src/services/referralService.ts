import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { Referral } from '../types';

const COLLECTION = 'referrals';

export const addReferral = async (referral: Omit<Referral, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...referral,
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

export const getReferrals = async (userId: string): Promise<Referral[]> => {
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
        createdAt: data.createdAt?.toDate?.() || new Date()
      } as Referral;
    });
  } catch (error) {
    console.error('Erro ao buscar indicações:', error);
    return [];
  }
};

export const getReferralStats = async (userId: string) => {
  const referrals = await getReferrals(userId);
  const total = referrals.length;
  const converted = referrals.filter(r => r.converted).length;
  const totalValue = referrals
    .filter(r => r.converted)
    .reduce((sum, r) => sum + (r.saleValue || 0), 0);
  
  return {
    total,
    converted,
    conversionRate: total > 0 ? (converted / total) * 100 : 0,
    totalValue
  };
};