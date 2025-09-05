'use client';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';

export default function UsersPage() {
  const [data, setData] = useState(null);
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    apiGet('/users', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(setData)
      .catch(console.error);
  }, []);
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}