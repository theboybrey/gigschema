"use client"

import { configurations } from '@/configurations'
import { IAddress, ILocation } from '@/interface/declarations'
import GooglePlacesAutocomplete, {
    geocodeByAddress,
    getLatLng
} from "react-google-places-autocomplete"
import { Search } from 'lucide-react'

interface Props {
    selectedAddress: (address: IAddress) => void
    setCoordinates?: (coordinates: { lat: number, lng: number }) => void
}

function LocationPickerFragment({ selectedAddress, setCoordinates }: Props) {
    const parseAddressComponents = (geoLocation: any): IAddress => {
        const addressComponents = geoLocation.address_components;
        let parsedAddress: Partial<IAddress> = {
            street: '',
            city: '',
            region: '',
            country: '',
            postalCode: '',
            location: {
                type: 'Point',
                coordinates: {
                    lat: geoLocation.geometry.location.lat(),
                    lng: geoLocation.geometry.location.lng()
                }
            }
        };

        addressComponents.forEach((component: any) => {
            const types = component.types;

            if (types.includes('street_number') || types.includes('route')) {
                parsedAddress.street = parsedAddress.street
                    ? `${parsedAddress.street} ${component.long_name}`
                    : component.long_name;
            }
            if (types.includes('locality') || types.includes('sublocality')) {
                parsedAddress.city = component.long_name;
            }
            if (types.includes('administrative_area_level_1')) {
                parsedAddress.region = component.long_name;
            }
            if (types.includes('country')) {
                parsedAddress.country = component.long_name;
            }
            if (types.includes('postal_code')) {
                parsedAddress.postalCode = component.long_name;
            }
        });

        return {
            street: parsedAddress.street || 'N/A',
            city: parsedAddress.city || 'N/A',
            region: parsedAddress.region || 'N/A',
            country: parsedAddress.country || 'N/A',
            postalCode: parsedAddress.postalCode,
            landmark: '',
            location: parsedAddress.location as ILocation
        };
    };

    const handleAddressSelect = async (address: any) => {
        try {
            const geoLocation = await geocodeByAddress(address.label);
            const coordinates = await getLatLng(geoLocation[0]);
            setCoordinates?.(coordinates);
            const formattedAddress = parseAddressComponents(geoLocation[0]);
            selectedAddress(formattedAddress);
        } catch (error) {
            console.error('Error selecting address:', error);
        }
    };

    return (
        <div className="relative w-full">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={18} />
            </div>
            <div className="w-full">
                <GooglePlacesAutocomplete
                    apiKey={configurations.api.key.googleMap}
                    selectProps={{
                        placeholder: "Enter your location",
                        onChange: handleAddressSelect,
                        styles: {
                            control: (provided) => ({
                                ...provided,
                                width: '100%',
                                backgroundColor: 'white',
                                borderWidth: '1px',
                                borderColor: '#D1D5DB',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                minHeight: '42px',
                                ':hover': {
                                    borderColor: '#D1D5DB'
                                },
                                ':focus-within': {
                                    borderColor: '#D1D5DB',
                                    boxShadow: 'none',
                                    outline: 'none'
                                }
                            }),
                            input: (provided) => ({
                                ...provided,
                                margin: '0',
                                padding: '0',
                                border: 'none',
                                outline: '0 none',
                                color: '#374151',
                                ':focus': {
                                    outline: 'none', 
                                    border: 'none'
                                }
                            }),
                            placeholder: (provided) => ({
                                ...provided,
                                color: '#9CA3AF'
                            }),
                            singleValue: (provided) => ({
                                ...provided,
                                color: '#374151'
                            }),
                            option: (provided, state) => ({
                                ...provided,
                                backgroundColor: state.isFocused ? '#F3F4F6' : 'white',
                                color: '#374151',
                                cursor: 'pointer',
                                ':active': {
                                    backgroundColor: '#E5E7EB'
                                }
                            }),
                            menu: (provided) => ({
                                ...provided,
                                borderRadius: '0.5rem',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                marginTop: '4px', 
                                border: '1px solid #D1D5DB'
                            }),
                            menuList: (provided) => ({
                                ...provided,
                                padding: '4px'
                            })
                        }
                    }}
                />
            </div>
        </div>
    );
}

export default LocationPickerFragment;