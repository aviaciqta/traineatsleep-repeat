import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth, storage } from '../firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';



const ProfileLogo = () => {

  const currentUser = useAuth();
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [photoURL, setPhotoURL] = useState('https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png');
  // Custom Hook
  function useAuth() {
    const [currentUser, setCurrentUser] = useState();

    useEffect(() => {
      const unsub = onAuthStateChanged(auth, user => setCurrentUser(user));
      return unsub;
    }, []);

    return currentUser;
  }

  // Storage
  async function upload(file, currentUser, setLoading) {
    const fileRef = ref(storage, currentUser.uid + '.png');

    setLoading(true);
// eslint-disable-next-line
    const snapshot = await uploadBytes(fileRef, file);
    const photoURL = await getDownloadURL(fileRef);

    updateProfile(currentUser, { photoURL });

    setLoading(false);
    alert('Uploaded file!');
  }
  function handleChange(e) {
    if (e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  }

  function handleClick() {
    upload(photo, currentUser, setLoading);
  }

  useEffect(() => {
    if (currentUser?.photoURL) {
      setPhotoURL(currentUser.photoURL);
    }
  }, [currentUser]);

  return (
    <div >
    <div className="container">
      <div className="blog-heading text-center py-2 mb-4">
      <span>{photo ? 'Create your profile picture' : 'Update your profile picture'}&nbsp; </span>
      <input type="file" onChange={handleChange} />
      <button disabled={loading || !photo} onClick={handleClick}>Upload</button>
      <div className="profile-logo">
        <img src={photoURL} alt="Avatar"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            marginTop: '10px',
          }} />
          </div>
      </div>
    </div>
    </div>
  );
};


export default ProfileLogo;

