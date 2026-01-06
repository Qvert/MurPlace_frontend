import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLang } from '../i18n.jsx'

const ExampleComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/items/');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const { t } = useLang()

  if (loading) return <div>{t('loading')}</div>;

  return (
    <div>
      <h1>{t('footer.tagline')}</h1>
      <ul>
        {data.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default ExampleComponent;