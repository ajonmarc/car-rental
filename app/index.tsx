//app/index.tsx
import React, { useState, useRef } from "react";
import { 
  Text, 
  View, 
  ScrollView, 
  SafeAreaView, 
  Image, 
  TouchableOpacity, 
  TextInput,
  StatusBar,
  Dimensions,
  FlatList
} from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const SCREEN_WIDTH = Dimensions.get('window').width;

// Type definitions
interface CarItem {
  id: string;
  title: string;
  image: any; // Using any for image require
  price: string;
}

export default function App() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const scrollToTop = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const carouselItems: CarItem[] = [
    {
      id: '1',
      title: "Premium Car 1",
      image: require('../assets/car1.png'),
      price: "$100/day"
    },
    {
      id: '2',
      title: "Premium Car 2",
      image: require('../assets/car2.jpg'),
      price: "$120/day"
    },
    {
      id: '3',
      title: "Premium Car 3",
      image: require('../assets/car3.png'),
      price: "$150/day"
    }
  ];

  const renderCarouselItem = ({ item }: { item: CarItem }) => {
    return (
      <View style={{
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        margin: 5,
        alignItems: 'center',
        width: SCREEN_WIDTH - 80,
      }}>
        <Image 
          source={item.image} 
          style={{width: '100%', height: 150, resizeMode: 'cover', borderRadius: 10}}
        />
        <Text style={{fontSize: 18, fontWeight: 'bold', marginTop: 10}}>{item.title}</Text>
        <Text style={{fontSize: 16, color: '#ff3333', fontWeight: 'bold'}}>{item.price}</Text>
        <TouchableOpacity 
          style={{
            backgroundColor: '#ff3333', 
            padding: 10, 
            borderRadius: 5, 
            marginTop: 10,
            width: '100%',
            alignItems: 'center'
          }}
        >
          <Text style={{color: 'white', fontWeight: '600'}}>Rent Now</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={{
        backgroundColor: '#000', 
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image 
            source={require('../assets/logoW.png')} 
            style={{width: 40, height: 40, marginRight: 10}} 
          />
          <Text style={{color: 'white', fontSize: 20, fontWeight: 'bold'}}>CARS Rent</Text>
        </View>
        <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)}>
          <Ionicons name={menuOpen ? "close" : "menu"} size={30} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* Mobile Navigation Menu */}
      {menuOpen && (
        <View style={{
          backgroundColor: 'rgba(0,0,0,0.9)',
          position: 'absolute',
          top: 70,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: 20,
        }}>
          <TouchableOpacity style={{paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)'}}>
            <Text style={{color: 'white', fontSize: 18}}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)'}}>
            <Text style={{color: 'white', fontSize: 18}}>Articles</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)'}}>
            <Text style={{color: 'white', fontSize: 18}}>Become a partner</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)'}}>
            <Text style={{color: 'white', fontSize: 18}}>About</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)'}}>
            <Text style={{color: 'white', fontSize: 18}}>Contact</Text>
          </TouchableOpacity>
          <View style={{flexDirection: 'row', justifyContent: 'space-around', marginTop: 20}}>
            <TouchableOpacity style={{
              backgroundColor: 'transparent',
              borderWidth: 1,
              borderColor: 'white',
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 5,
              width: '45%',
              alignItems: 'center'
            }}
            onPress={() => router.push('/register')}
            >
              <Text style={{color: 'white', fontWeight: '600'}}>Register</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{
              backgroundColor: '#ff3333',
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 5,
              width: '45%',
              alignItems: 'center'
              
            }}
            onPress={() => router.push('/login')}
            >
              <Text style={{color: 'white', fontWeight: '600'}}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView ref={scrollViewRef} style={{flex: 1}}>
        {/* Hero Section */}
        <View style={{
          height: 300,
          backgroundColor: '#000',
          padding: 20,
          justifyContent: 'center',
          position: 'relative'
        }}>
          <Image 
            source={require('../assets/background.jpg')}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.6
            }}
          />
          <View style={{marginTop: 40}}>
            <Text style={{color: 'white', fontSize: 28, fontWeight: 'bold'}}>Cars Location</Text>
            <Text style={{
              color: 'white',
              fontSize: 24,
              fontWeight: 'bold',
              paddingBottom: 10,
              borderBottomWidth: 2,
              borderBottomColor: 'white',
              marginBottom: 20
            }}>Find the car you need</Text>
            
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 20}}>
              <TouchableOpacity style={{
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: 'white',
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 5,
                width: '48%',
                alignItems: 'center'
              }}
              onPress={() => router.push('/register')}
              >
                <Text style={{color: 'white', fontWeight: '600'}}>Register</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: 'white',
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 5,
                width: '48%',
                alignItems: 'center'
              }}
              onPress={() => router.push('/login')}
              >
                <Text style={{color: 'white', fontWeight: '600'}}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Premium Cars Section */}
        <View style={{padding: 20, backgroundColor: '#f7f7f7'}}>
          <View style={{alignItems: 'center', marginBottom: 20}}>
            <Text style={{fontSize: 24, fontWeight: 'bold', color: '#333'}}>Premium Cars</Text>
            <View style={{
              height: 3,
              backgroundColor: '#ffcccc',
              width: 150,
              marginTop: 10,
              position: 'relative'
            }}>
              <View style={{
                position: 'absolute',
                height: 3,
                backgroundColor: '#ff3333',
                width: 75,
                top: 0,
                left: 0
              }} />
            </View>
          </View>

          {/* Replace Carousel with FlatList */}
          <FlatList
            data={carouselItems}
            renderItem={renderCarouselItem}
            keyExtractor={item => item.id}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            snapToAlignment="center"
            contentContainerStyle={{paddingHorizontal: 10}}
          />
        </View>

        {/* Become a Partner Section */}
        <View style={{
          padding: 20,
          backgroundColor: '#f2f2f2',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          borderBottomWidth: 1,
          borderBottomColor: '#e0e0e0',
        }}>
          <View style={{alignItems: 'center', marginBottom: 20}}>
            <Text style={{fontSize: 24, fontWeight: 'bold', color: '#333'}}>Become a partner</Text>
            <View style={{
              height: 3,
              backgroundColor: '#ffcccc',
              width: 150,
              marginTop: 10,
              position: 'relative'
            }}>
              <View style={{
                position: 'absolute',
                height: 3,
                backgroundColor: '#ff3333',
                width: 75,
                top: 0,
                left: 0
              }} />
            </View>
          </View>

          <View style={{alignItems: 'center', marginTop: 20}}>
            <Text style={{fontSize: 26, color: '#666', fontStyle: 'italic', textAlign: 'center', marginBottom: 10}}>
              You want to make some extra money from renting your cars
            </Text>
            <TouchableOpacity style={{
              backgroundColor: '#ff3333',
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 5,
              width: '100%',
              alignItems: 'center',
              marginTop: 20
            }}>
              <Text style={{color: 'white', fontWeight: '600', fontSize: 16}}>TAKE PLACE WITH US NOW</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Us Section */}
        <View style={{padding: 20}}>
          <View style={{alignItems: 'center', marginBottom: 30}}>
            <Text style={{fontSize: 24, fontWeight: 'bold', color: '#333'}}>About us</Text>
            <View style={{
              height: 3,
              backgroundColor: '#ffcccc',
              width: 150,
              marginTop: 10,
              position: 'relative'
            }}>
              <View style={{
                position: 'absolute',
                height: 3,
                backgroundColor: '#ff3333',
                width: 75,
                top: 0,
                left: 0
              }} />
            </View>
          </View>

          <View style={{alignItems: 'center', marginBottom: 20, paddingBottom: 20, borderBottomWidth: 2, borderBottomColor: '#000'}}>
            <Image 
              source={require('../assets/logo.png')} 
              style={{width: 100, height: 100, marginBottom: 10}} 
            />
            <Text style={{fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 5}}>CARS rent</Text>
            <Text style={{fontSize: 16, color: '#666', textAlign: 'center'}}>Our mission is to find what you need</Text>
          </View>

          <Text style={{fontSize: 16, lineHeight: 22, color: '#666', marginBottom: 20}}>
            With us you will quickly get the car you want. With our partner network it is going to be fluid and easy, it is possible for us to respond to your special requests.
            {'\n\n'}
            Our logistics partners make the rent easy for you.
          </Text>

          <View style={{marginTop: 20}}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
              <FontAwesome name="check" size={16} color="#333" style={{marginRight: 10}} />
              <Text style={{fontSize: 16, color: '#333'}}>Fast responding</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
              <FontAwesome name="check" size={16} color="#333" style={{marginRight: 10}} />
              <Text style={{fontSize: 16, color: '#333'}}>Secure process</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
              <FontAwesome name="check" size={16} color="#333" style={{marginRight: 10}} />
              <Text style={{fontSize: 16, color: '#333'}}>Exclusive selection</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
              <FontAwesome name="check" size={16} color="#333" style={{marginRight: 10}} />
              <Text style={{fontSize: 16, color: '#333'}}>Premium service</Text>
            </View>
          </View>
        </View>

        {/* Contact Us Section */}
        <View style={{padding: 20, backgroundColor: '#f7f7f7'}}>
          <View style={{alignItems: 'center', marginBottom: 30}}>
            <Text style={{fontSize: 24, fontWeight: 'bold', color: '#333'}}>Contact us</Text>
            <View style={{
              height: 3,
              backgroundColor: '#ffcccc',
              width: 150,
              marginTop: 10,
              position: 'relative'
            }}>
              <View style={{
                position: 'absolute',
                height: 3,
                backgroundColor: '#ff3333',
                width: 75,
                top: 0,
                left: 0
              }} />
            </View>
          </View>

          <View style={{backgroundColor: 'white', padding: 20, borderRadius: 10, shadowColor: "#000", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5}}>
            <TextInput 
              placeholder="Your Name"
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 5,
                padding: 12,
                marginBottom: 15
              }}
            />
            <TextInput 
              placeholder="Your Email"
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 5,
                padding: 12,
                marginBottom: 15
              }}
              keyboardType="email-address"
            />
            <TextInput 
              placeholder="Message"
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 5,
                padding: 12,
                marginBottom: 15,
                height: 120,
                textAlignVertical: 'top'
              }}
              multiline={true}
              numberOfLines={5}
            />
            <TouchableOpacity style={{
              backgroundColor: '#ff3333',
              paddingVertical: 12,
              borderRadius: 5,
              alignItems: 'center'
            }}>
              <Text style={{color: 'white', fontWeight: '600', fontSize: 16}}>SEND MESSAGE</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={{padding: 20, backgroundColor: '#000'}}>
          <Text style={{fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 20}}>Keep yourself on update</Text>
          <Text style={{fontSize: 16, color: '#bbb', marginBottom: 20}}>
            To ensure that all our articles and promotions reach you keep in touch with us. Don't forget to rate us.
          </Text>
          
          <TouchableOpacity style={{
            backgroundColor: '#ff3333',
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 5,
            width: 150,
            alignItems: 'center',
            marginBottom: 30
          }}>
            <Text style={{color: 'white', fontWeight: '600'}}>Contact US</Text>
          </TouchableOpacity>

          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#333'}}>
            <Image 
              source={require('../assets/logoW.png')} 
              style={{width: 40, height: 40}} 
            />
            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity style={{marginHorizontal: 10}}>
                <FontAwesome name="facebook" size={24} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={{marginHorizontal: 10}}>
                <FontAwesome name="twitter" size={24} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={{marginHorizontal: 10}}>
                <FontAwesome name="youtube" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={{color: '#666', textAlign: 'center', marginTop: 20}}>Copyright © 2025</Text>
        </View>
      </ScrollView>
      
      {/* Scroll to top button */}
      <TouchableOpacity 
        onPress={scrollToTop}
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          backgroundColor: '#ff3333',
          width: 40,
          height: 40,
          borderRadius: 20,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Ionicons name="arrow-up" size={20} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}