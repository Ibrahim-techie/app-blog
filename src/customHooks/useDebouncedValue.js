import { useState ,useEffect} from "react";

function useDebouncedValue(value,delay=300){

    const [DebouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      
const timer=setTimeout(() => {
    setDebouncedValue(value);
}, delay);
    
      return () => {
        clearTimeout(timer);
      }
    }, [value,delay])

    return DebouncedValue;
    
}

export default useDebouncedValue;
