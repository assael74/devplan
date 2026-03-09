import React, { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './FbConfig';
import {
  Box,
  Typography,
  Select,
  Option,
  Input,
  Button
} from '@mui/joy';

export default function DocumentSizeChecker() {
  const [collectionName, setCollectionName] = useState('');
  const [docId, setDocId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleCheckSize = async () => {
    setResult(null);
    setError('');
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const sizeInBytes = new TextEncoder().encode(JSON.stringify(data)).length;

        setResult(sizeInBytes);
        // 🖨️ הדפסת תוכן המסמך
        console.log(`📄 תוכן המסמך (${collectionName}/${docId}):`, data);
        console.log(`גודל משוער: ${sizeInBytes.toLocaleString()} bytes`);
      } else {
        setError('לא נמצא מסמך עם ID זה');
      }
    } catch (err) {
      console.error(err);
      setError('שגיאה בעת ניסיון קריאה מה־Firestore');
    }
  };
  //console.log(result)
  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography level="h4">בדיקת גודל מסמך Firestore</Typography>

      <Select
        placeholder="בחר קולקשן"
        value={collectionName}
        sx={{
          width: '100%'
        }}
        onChange={(e, val) => setCollectionName(val)}
      >
        <Option value="playerEvaluations">playerEvaluations</Option>
        <Option value="playersShorts">players</Option>
        <Option value="gamesShorts">games</Option>
        <Option value="teamsShorts">teams</Option>
        {/* הוסף עוד קולקשנים אם צריך */}
      </Select>

      <Input
        placeholder="הכנס Document ID"
        value={docId}
        onChange={(e) => setDocId(e.target.value)}
      />

      <Button onClick={handleCheckSize}>חשב גודל</Button>

      {result !== null && (
        <Typography>גודל משוער: {result.toLocaleString()} bytes</Typography>
      )}
      {error && (
        <Typography color="danger">{error}</Typography>
      )}
    </Box>
  );
}
