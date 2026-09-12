import { useState, useEffect, useRef } from "react";

function usePaginatedList({ fetchPage, resetKey, pageSize = 12 }) {
  const [data, setData] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const requestId = useRef(0);

  useEffect(() => {
    const id = ++requestId.current;

    setData([]);
    setCursor(null);
    setHasMore(true);
    setError(null);
    setLoading(true);

    fetchPage(null)
      .then((rows) => {
        if (id !== requestId.current) return;
        setData(rows);
        setHasMore(rows.length === pageSize);
        if (rows.length > 0) {
          setCursor(rows[rows.length - 1].$id);
        }
      })
      .catch((err) => {
        if (id !== requestId.current) return;
        setError(err.message);
      })
      .finally(() => {
        if (id !== requestId.current) return;
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const loadMore = () => {
    if (loading || !hasMore) return;

    const id = ++requestId.current;
    setLoading(true);
    setError(null);

    fetchPage(cursor)
      .then((rows) => {
        if (id !== requestId.current) return;
        setData((prev) => [...prev, ...rows]);
        setHasMore(rows.length === pageSize);
        if (rows.length > 0) {
          setCursor(rows[rows.length - 1].$id);
        }
      })
      .catch((err) => {
        if (id !== requestId.current) return;
        setError(err.message);
      })
      .finally(() => {
        if (id !== requestId.current) return;
        setLoading(false);
      });
  };

  return { data, loading, hasMore, error, loadMore };
}

export default usePaginatedList;