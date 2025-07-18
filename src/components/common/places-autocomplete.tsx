'use client';

import { useRef, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';

interface PlacesAutocompleteProps {
  onLocationSelect: (location: string) => void;
  initialValue?: string;
}

export function PlacesAutocomplete({ onLocationSelect, initialValue = '' }: PlacesAutocompleteProps) {
  const autocompleteInput = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (typeof window.google === 'undefined' || !autocompleteInput.current) {
        return;
    }
      
    const autocomplete = new window.google.maps.places.Autocomplete(
      autocompleteInput.current,
      {
        types: ['(cities)'],
        fields: ['formatted_address'],
      }
    );

    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place && place.formatted_address) {
        setValue(place.formatted_address);
        onLocationSelect(place.formatted_address);
      }
    });

    return () => {
        window.google.maps.event.removeListener(listener);
        // Clean up the autocomplete instance on component unmount
        const pacContainers = document.querySelectorAll('.pac-container');
        pacContainers.forEach(container => container.remove());
    };
  }, [onLocationSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onLocationSelect(e.target.value); // Keep form state up-to-date while typing
  };

  return (
    <Input
      ref={autocompleteInput}
      placeholder="e.g., New York, USA"
      value={value}
      onChange={handleChange}
    />
  );
}
