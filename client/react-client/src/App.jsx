import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import { parseLinkHeader } from "../../parseLinkHeader";

function App() {
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const nextPhotoUrlRef = useRef();

  const LIMIT = 10;
  const INITIAL_FETCH_URL = `http://localhost:3000/photos?_page=1&_limit=${LIMIT}`;

  async function fetchPhotos(url, { overwrite = false } = {}) {
    setIsLoading(true);

    try {
      const response = await fetch(url);
      const { next } = parseLinkHeader(response.headers.get("Link"));
      nextPhotoUrlRef.current = next;
      const photos = await response.json();

      if (overwrite) {
        setPhotos(photos);
      } else {
        setPhotos((prevPhotos) => {
          return [...prevPhotos, ...photos];
        });
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }

  const imageRef = useCallback((image) => {
    if (image == null || nextPhotoUrlRef.current == null) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        console.log("Last element shown");
        // load next elements
        fetchPhotos(nextPhotoUrlRef.current);
        observer.unobserve(image);
      }
    });

    observer.observe(image);
  }, []);

  useEffect(() => {
    fetchPhotos(INITIAL_FETCH_URL, {
      overwrite: true,
    });
  }, []);

  return (
    <div className="grid">
      {photos?.map(({ url, id }, index) => (
        <img
          key={id}
          src={url}
          ref={index === photos.length - 1 ? imageRef : undefined}
        />
      ))}
      {/* <div className="skeleton">Loading...</div>
      <div className="skeleton">Loading...</div>
      <div className="skeleton">Loading...</div>
      <div className="skeleton">Loading...</div>
      <div className="skeleton">Loading...</div>
      <div className="skeleton">Loading...</div> */}
      {isLoading &&
        Array.from({ length: LIMIT }, (_, index) => index).map((n) => (
          <div key={n} className="skeleton">
            Loading...
          </div>
        ))}
    </div>
  );
}

export default App;
