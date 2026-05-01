'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
const Config = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/app/config/adoption_business_kpi');
  });
  return <></>;
};

export default Config;
