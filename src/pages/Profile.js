import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    limit,
    onSnapshot,
    query,
    orderBy,
    where,
    startAfter,
} from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import ProfileSection from '../components/ProfileSection';
import Spinner from '../components/Spinner';
import { db } from '../firebase';
import { toast } from 'react-toastify';
import Trending from '../components/Trending';
import Category from '../components/Category';

const Profile = ({ setActive, user, active }) => {
    const [loading, setLoading] = useState(true);
    const [blogs, setBlogs] = useState([]);
    const [lastVisible, setLastVisible] = useState(null);
    const [trendBlogs, setTrendBlogs] = useState([]);
    const [totalBlogs, setTotalBlogs] = useState(null);
    const [hide, setHide] = useState(false);

    const getTrendingBlogs = async () => {
        const blogRef = collection(db, 'blogs');
        const trendQuery = query(blogRef, where('trending', '==', 'yes'));
        const querySnapshot = await getDocs(trendQuery);
        let trendBlogs = [];
        querySnapshot.forEach((doc) => {
            trendBlogs.push({ id: doc.id, ...doc.data() });
        });
        setTrendBlogs(trendBlogs);
    };

    useEffect(() => {
        getTrendingBlogs();

        const unsub = onSnapshot(
            collection(db, 'blogs'),
            (snapshot) => {
                let list = [];
                let tags = [];
                snapshot.docs.forEach((doc) => {
                    tags.push(...doc.get('tags'));
                    list.push({ id: doc.id, ...doc.data() });
                });

                setTotalBlogs(list);
                // setBlogs(list);
                setLoading(false);
                setActive('profile');
            },
            (error) => {
                console.log(error);
            }
        );

        return () => {
            unsub();
            getTrendingBlogs();
        };
    }, [setActive, active]);

    useEffect(() => {
        getBlogs();
        setHide(false);
    }, [active]);

    const getBlogs = async () => {
        const blogRef = collection(db, 'blogs');
        console.log(blogRef);
        const firstFour = query(blogRef, orderBy('timestamp', 'desc'), limit(4));
        const docSnapshot = await getDocs(firstFour);
        setBlogs(docSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLastVisible(docSnapshot.docs[docSnapshot.docs.length - 1]);
    };

    console.log('blogs', blogs);

    const updateState = (docSnapshot) => {
        const isCollectionEmpty = docSnapshot.size === 0;
        if (!isCollectionEmpty) {
            const blogsData = docSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setBlogs((blogs) => [...blogs, ...blogsData]);
            setLastVisible(docSnapshot.docs[docSnapshot.docs.length - 1]);
        } else {
            toast.info('No more blog to display');
            setHide(true);
        }
    };

    const fetchMore = async () => {
        setLoading(true);
        const blogRef = collection(db, 'blogs');
        const nextFour = query(
            blogRef,
            orderBy('timestamp','desc'),
            limit(4),
            startAfter(lastVisible)
        );
        const docSnapshot = await getDocs(nextFour);
        updateState(docSnapshot);
        setLoading(false);
    };

    if (loading) {
        return <Spinner />;
    }

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure wanted to delete that blog ?')) {
            try {
                setLoading(true);
                await deleteDoc(doc(db, 'blogs', id));
                toast.success('Blog deleted successfully');
                setLoading(false);
            } catch (err) {
                console.log(err);
            }
        }
    };

    // category count
    const counts = totalBlogs.reduce((prevValue, currentValue) => {
        let name = currentValue.category;
        if (!prevValue.hasOwnProperty(name)) {
            prevValue[name] = 0;
        }
        prevValue[name]++;
        // delete prevValue["undefined"];
        return prevValue;
    }, {});

    const categoryCount = Object.keys(counts).map((k) => {
        return {
            category: k,
            count: counts[k],
        };
    });

    console.log('categoryCount', categoryCount);

    return (
        <div className="container-fluid pb-4 pt-4 padding">
            <div className="container padding">
                <div className="row mx-0">
                    <Trending blogs={trendBlogs} />
                    <div className="col-md-8">
                        <div className="blog-heading text-start py-2 mb-4">{user.displayName} Blogs</div>
                        
                        {blogs?.map((blog) => (
                            <ProfileSection
                                key={blog.id}
                                user={user}
                                handleDelete={handleDelete}
                                {...blog}
                            />
                        ))}

                        {!hide && (
                            <button className="btn btn-primary" onClick={fetchMore}>
                                Load More
                            </button>
                        )}
                    </div>
                    <div className="col-md-3">

                        
                        <Category catgBlogsCount={categoryCount} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
