import React from 'react';
import './App.css';
import { withGoogleMap, GoogleMap, withScriptjs, InfoWindow, Marker } from "react-google-maps";
import Geocode from "react-geocode";
import Autocomplete from 'react-google-autocomplete';
import { Descriptions } from 'antd';

Geocode.setApiKey("AIzaSyCztEOrWFLcpFNvpEtkGUVcgKe8Mv3n08E") //위경도로 정보 찾는거

class App extends React.Component {

  //기본 형태 지정
  state = {
      address: '',
      city: '',
      area: '',
      state: '',
      zoom: 15,
      height: 400,
      mapPosition: {
          lat: 0,
          lng: 0,
      },
      markerPosition: {
          lat: 0,
          lng: 0,
      }
  }


  componentDidMount() { //처음 초기설정
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(position => {
              this.setState({
                  mapPosition: {
                      lat: position.coords.latitude,
                      lng: position.coords.longitude,
                  },
                  markerPosition: {
                      lat: position.coords.latitude,
                      lng: position.coords.longitude,
                  }
              },
                  () => {
                      Geocode.fromLatLng(position.coords.latitude, position.coords.longitude).then(
                          response => {
                              console.log(response)
                              const address = response.results[0].formatted_address,
                                  addressArray = response.results[0].address_components,
                                  city = this.getCity(addressArray),
                                  area = this.getArea(addressArray),
                                  state = this.getState(addressArray);
                              this.setState({
                                  address: (address) ? address : '',
                                  area: (area) ? area : '',
                                  city: (city) ? city : '',
                                  state: (state) ? state : '',
                              })
                          },
                          error => {
                              console.error(error);
                          }
                      );

                  })
          });
      } else {
          console.error("Geolocation is not supported by this browser!");
      }
  };

  getCity = (addressArray) => { // 도시
      let city = '';
      for (let i = 0; i < addressArray.length; i++) {
          if (addressArray[i].types[0] && 'administrative_area_level_2' === addressArray[i].types[0]) {
              city = addressArray[i].long_name;
              return city;
          }
      }
  };

  getArea = (addressArray) => { //지역
      let area = '';
      for (let i = 0; i < addressArray.length; i++) {
          if (addressArray[i].types[0]) {
              for (let j = 0; j < addressArray[i].types.length; j++) {
                  if ('sublocality_level_1' === addressArray[i].types[j] || 'locality' === addressArray[i].types[j]) {
                      area = addressArray[i].long_name;
                      return area;
                  }
              }
          }
      }
  };

  getState = (addressArray) => { //지역2
      let state = '';
      for (let i = 0; i < addressArray.length; i++) {
          for (let i = 0; i < addressArray.length; i++) {
              if (addressArray[i].types[0] && 'administrative_area_level_1' === addressArray[i].types[0]) {
                  state = addressArray[i].long_name;
                  return state;
              }
          }
      }
  };

  onChange = (event) => {
      this.setState({ [event.target.name]: event.target.value });
  };

  onMarkerDragEnd = (event) => {
      let newLat = event.latLng.lat(), //위경도 드랍다운
          newLng = event.latLng.lng();

      Geocode.fromLatLng(newLat, newLng).then(
          response => {
              const address = response.results[0].formatted_address,
                  addressArray = response.results[0].address_components,
                  city = this.getCity(addressArray),
                  area = this.getArea(addressArray),
                  state = this.getState(addressArray);
              this.setState({
                  address: (address) ? address : '',
                  area: (area) ? area : '',
                  city: (city) ? city : '',
                  state: (state) ? state : '',
                  markerPosition: {
                      lat: newLat,
                      lng: newLng
                  },
                  mapPosition: {
                      lat: newLat,
                      lng: newLng
                  },
              })
          },
          error => {
              console.error(error);
          }
      );
  };

  onPlaceSelected = (place) => {
      console.log('plc', place);
      const address = place.formatted_address,
          addressArray = place.address_components,
          city = this.getCity(addressArray),
          area = this.getArea(addressArray),
          state = this.getState(addressArray),
          latValue = place.geometry.location.lat(),
          lngValue = place.geometry.location.lng();

      console.log('latvalue', latValue)
      console.log('lngValue', lngValue)

      this.setState({
          address: (address) ? address : '',
          area: (area) ? area : '',
          city: (city) ? city : '',
          state: (state) ? state : '',
          markerPosition: {
              lat: latValue,
              lng: lngValue
          },
          mapPosition: {
              lat: latValue,
              lng: lngValue
          },
      })
  };

  render() {
      const AsyncMap = withScriptjs(
          withGoogleMap(
              props => (
                  <GoogleMap
                      defaultZoom={this.state.zoom}
                      defaultCenter={{ lat: this.state.mapPosition.lat, lng: this.state.mapPosition.lng }}
                  >
                      {/* 마커 */}
                      <Marker
                          google={this.props.google}
                          name={'Dolores park'}
                          draggable={true}
                          onDragEnd={this.onMarkerDragEnd}
                          position={{ lat: this.state.markerPosition.lat, lng: this.state.markerPosition.lng }}
                      />
                      {/* 말풍선 */}
                      <InfoWindow
                          onClose={this.onInfoWindowClose}
                          position={{ lat: (this.state.markerPosition.lat + 0.0018), lng: this.state.markerPosition.lng }}
                      >
                          <div>
                              <span style={{ padding: 0, margin: 0 }}>{this.state.address}</span>
                          </div>
                      </InfoWindow>
                      <Marker />

                      {/* 검색창 */}
                      <Autocomplete
                          style={{
                              width: '100%',
                              height: '40px',
                              paddingLeft: '16px',
                              marginTop: '2px',
                              marginBottom: '2rem'
                          }}
                          onPlaceSelected={this.onPlaceSelected}
                          types={['(regions)']}
                      />
                  </GoogleMap>
              )
          )
      );

      return (
          <div style={{ padding: '1rem', margin: '0 auto', maxWidth: 1000 }}>
              <h1>Google Map Basic</h1>
              <Descriptions bordered>
                  <Descriptions.Item label="City">{this.state.city}</Descriptions.Item>
                  <Descriptions.Item label="Area">{this.state.area}</Descriptions.Item>
                  <Descriptions.Item label="State">{this.state.state}</Descriptions.Item>
                  <Descriptions.Item label="Address">{this.state.address}</Descriptions.Item>
              </Descriptions>

              <AsyncMap
                  googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyCztEOrWFLcpFNvpEtkGUVcgKe8Mv3n08E&libraries=places"
                  loadingElement={
                      <div style={{ height: `100%` }} />
                  }
                  containerElement={
                      <div style={{ height: this.state.height }} />
                  }
                  mapElement={
                      <div style={{ height: `100%` }} />
                  }
              />
          </div>
      )
  }

}

export default App;