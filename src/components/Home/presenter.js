import React, { PropTypes } from 'react';
import {
  Alert,
  Dimensions,
  Linking,
  Text,
  View,
} from 'react-native';
import MapView from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Touchable from '../common/F8Touchable';
import AnimatedLogo from '../common/AnimatedLogo';
import FloatingActionButton from '../common/FloatingActionButton';
import colors from '../common/color';
import styles from './style';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const initialLatitudeDelta = 0.05; // Approx. viewport of 5km horizontally
const initialLongitudeDelta = initialLatitudeDelta * ASPECT_RATIO;
const latitudeDelta = 0.005; // Approx. viewport of 500m horizontally
const longitudeDelta = latitudeDelta * ASPECT_RATIO;

class Home extends React.Component {
  componentDidUpdate(prevProps) {
    const { latitude, longitude, places, index } = this.props;
    const place = places[index];
    if (this.map &&
      (prevProps.latitude !== latitude ||
      prevProps.longitude !== longitude)) {
      this.map.animateToRegion({ latitude, longitude, latitudeDelta, longitudeDelta });
    } else if (this.map && place) {
      this.map.animateToRegion({
        latitude: place.latitude,
        longitude: place.longitude,
        latitudeDelta,
        longitudeDelta,
      });
    }
  }

  handleNavigate() {
    const { places, index } = this.props;
    const { latitude, longitude, name } = places[index];
    const url = `geo:0,0?q=${latitude},${longitude}(${name})`;
    Linking.openURL(url).catch((err) => {
      Alert.alert(
        'An error occurred',
        err,
        [{ text: 'OK' }]
      );
    });
  }

  handleGetRandomPlace() {
    this.props.getNextPlace();
  }

  renderRating(rating) {
    if (rating) {
      const stars = [];
      for (let i = 0; i < 5; i++) {
        stars.push((
          <Icon
            name={Math.round(rating) > i ? 'star' : 'star-border'}
            size={24}
            color={colors.ratingColor}
            key={i}
          />
        ));
      }
      return (
        <View style={styles.rating}>
          {stars}
        </View>
      );
    }

    return null;
  }

  renderSelectedPlace() {
    const { places, index } = this.props;
    const place = places[index];
    if (place) {
      return (
        <View style={styles.textContainer}>
          <Text style={styles.text}>{place.name}</Text>
          <Text
            numberOfLines={1}
            style={styles.subtext}
          >
            {place.vicinity}
          </Text>
          {this.renderRating(place.rating)}
          <View style={styles.separator} />
          <Touchable
            onPress={() => this.handleNavigate()}
          >
            <View style={styles.navContainer}>
              <Text style={styles.navText}>GET DIRECTIONS</Text>
            </View>
          </Touchable>
        </View>
      );
    }
    return (
      <View style={[styles.textContainer, styles.textContainerWithoutAction]}>
        <Text style={styles.text}>Foodlander</Text>
        <Text style={styles.subtext}>
          Tap the button below to discover your next favourite food place.
        </Text>
      </View>
    );
  }

  renderMarkers() {
    const { places, index } = this.props;
    return places.map((place, i) => {
      const { latitude, longitude, place_id: id } = place;
      const color = index === i ? colors.selectedPinColor : colors.accentColor;
      return (
        <MapView.Marker
          coordinate={{ latitude, longitude }}
          identifier={id}
          pinColor={color}
          title={place.name}
          key={id}
        />
      );
    });
  }

  render() {
    const { latitude, longitude, places } = this.props;

    if (!places.length) {
      return <AnimatedLogo />;
    }

    return (
      <View style={styles.container}>
        <MapView
          ref={(c) => { this.map = c; }}
          showsUserLocation
          followsUserLocation
          showsMyLocationButton={false}
          initialRegion={{
            latitude,
            longitude,
            latitudeDelta: initialLatitudeDelta,
            longitudeDelta: initialLongitudeDelta,
          }}
          style={styles.map}
        >
          {this.renderMarkers()}
        </MapView>
        {this.renderSelectedPlace()}
        <FloatingActionButton
          position="center"
          onPress={() => this.handleGetRandomPlace()}
          buttonColor={colors.accentColor}
        >
          <Icon name="local-dining" size={24} color="#fff" />
        </FloatingActionButton>
      </View>
    );
  }
}

Home.propTypes = {
  getNextPlace: PropTypes.func,
  getNearbyPlaces: PropTypes.func,
  latitude: PropTypes.number,
  longitude: PropTypes.number,
  places: PropTypes.array,
  index: PropTypes.number,
};

export default Home;
