import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  ActivityIndicator, 
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
  Dimensions
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { Upload, Copy, Sparkles, Zap, Heart, Smile, Flame, Briefcase, Coffee, MessageCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const TONES = [
  { id: 'Funny', icon: Smile, color: ['#FF9966', '#FF5E62'] },
  { id: 'Cool', icon: Zap, color: ['#4facfe', '#00f2fe'] },
  { id: 'Flirty', icon: Heart, color: ['#fa709a', '#fee140'] },
  { id: 'Roast', icon: Flame, color: ['#F5515F', '#9F041B'] },
  { id: 'Professional', icon: Briefcase, color: ['#434343', '#000000'] },
  { id: 'Nonchalant', icon: Coffee, color: ['#606c88', '#3f4c6b'] },
];

  const API_URL = 'https://backend-one-amber-44.vercel.app';

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<string>('Cool');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [intensity, setIntensity] = useState<string>('normal'); // normal, high, extreme, nuclear

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0].base64) {
      setImage(result.assets[0].uri);
      setBase64Image(result.assets[0].base64);
      setSuggestions([]);
      setIntensity('normal');
    }
  };

  const generateResponses = async (customIntensity?: string) => {
    if (!base64Image) {
      Alert.alert('No Image', 'Please upload a screenshot first!');
      return;
    }

    const targetIntensity = customIntensity || intensity;
    setLoading(true);
    // Don't clear suggestions if refining so UI doesn't jump too much
    if (!customIntensity) setSuggestions([]); 

    try {
      console.log(`Sending request to ${API_URL}/generate`);
      
      const mediaType = image?.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
      
      const response = await axios.post(`${API_URL}/generate`, {
        image: base64Image,
        tone: selectedTone,
        mediaType: mediaType,
        intensity: targetIntensity
      });

      console.log('Response:', response.data);

      if (response.data && response.data.suggestions) {
        setSuggestions(response.data.suggestions);
      } else {
        Alert.alert('Error', 'No suggestions received.');
      }
    } catch (error: any) {
      console.error("Full Error Object:", error);
      let errorMessage = 'Failed to connect to server.';
      
      if (error.response) {
        errorMessage = `Server Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        errorMessage = 'Network Error: No response received from server. Check IP address.';
      } else {
        errorMessage = `Request Error: ${error.message}`;
      }
      
      Alert.alert('Debug Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleIntensify = () => {
    let newIntensity = 'high';
    if (intensity === 'high') newIntensity = 'extreme';
    else if (intensity === 'extreme') newIntensity = 'nuclear';
    
    setIntensity(newIntensity);
    generateResponses(newIntensity);
  };

  const getIntensifyLabel = () => {
    if (intensity === 'normal') return 'Make it Spicier 🌶️';
    if (intensity === 'high') return 'EVEN SPICIER 🔥';
    if (intensity === 'extreme') return 'GO NUCLEAR ☢️';
    return 'MAXIMUM CHAOS 💀';
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied!', 'Response copied to clipboard.');
  };

  return (
    <LinearGradient 
      colors={['#2E0249', '#570A57', '#A91079']} // Cyberpop: Deep Purple -> Magenta
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitleMain}>I SUCK AT</Text>
            <Text style={styles.headerTitleSub}>TEXTING</Text>
          </View>
          <LinearGradient
            colors={['#FF0099', '#493240']}
            style={styles.logoBadge}
          >
            <MessageCircle color="#fff" size={20} />
          </LinearGradient>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Image Upload Area */}
          <TouchableOpacity style={styles.uploadContainer} onPress={pickImage} activeOpacity={0.8}>
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.02)']}
              style={styles.uploadGradient}
            >
              {image ? (
                <Image source={{ uri: image }} style={styles.previewImage} resizeMode="cover" />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <View style={styles.iconCircle}>
                    <Upload color="#FFF" size={28} />
                  </View>
                  <Text style={styles.uploadText}>Tap to Upload Screenshot</Text>
                </View>
              )}
              {image && (
                <View style={styles.changeImageBadge}>
                  <Text style={styles.changeImageText}>Change</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Tone Selector */}
          <Text style={styles.sectionTitle}>Select Vibe</Text>
          <View style={styles.gridContainer}>
            {TONES.map((tone) => {
              const Icon = tone.icon;
              const isSelected = selectedTone === tone.id;
              
              return (
                <TouchableOpacity
                  key={tone.id}
                  style={styles.gridItem}
                  onPress={() => setSelectedTone(tone.id)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={isSelected ? tone.color : ['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)']}
                    style={[styles.gridItemGradient, isSelected && styles.gridItemGradientSelected]}
                  >
                    <Icon size={22} color={isSelected ? '#fff' : '#CCC'} />
                    <Text style={[styles.gridItemText, isSelected && styles.gridItemTextSelected]}>
                      {tone.id}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Generate Button */}
          <TouchableOpacity 
            onPress={() => generateResponses()}
            disabled={!image || loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={(!image || loading) ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] : ['#FF512F', '#DD2476']} // Hot Pink/Orange
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.generateButton}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.btnContent}>
                  <Sparkles color={!image ? '#AAA' : '#fff'} size={18} style={{marginRight: 8}} />
                  <Text style={[styles.generateButtonText, !image && {color: '#AAA'}]}>
                    {image ? 'Generate Responses' : 'Generate Responses'}
                  </Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Results Section */}
          {suggestions.length > 0 && (
            <View style={styles.resultsContainer}>
              <View style={styles.resultsHeader}>
                <Text style={styles.sectionTitle}>Drafts</Text>
              </View>
              
              {suggestions.map((suggestion, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.chatBubble}
                  onPress={() => copyToClipboard(suggestion)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.chatBubbleText}>{suggestion}</Text>
                  <View style={styles.copyBadge}>
                    <Copy color="#fff" size={14} />
                  </View>
                </TouchableOpacity>
              ))}

              {/* Intensify Button - Moved to Bottom of Results for easier access */}
              {!loading && intensity !== 'nuclear' && (
                <TouchableOpacity onPress={handleIntensify} style={styles.intensifyContainer} activeOpacity={0.8}>
                  <LinearGradient
                    colors={intensity === 'extreme' ? ['#FF0000', '#950000'] : ['#FF512F', '#DD2476']}
                    start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                    style={styles.intensifyGradient}
                  >
                    <Text style={styles.intensifyText}>{getIntensifyLabel()}</Text>
                    <Flame color="#fff" size={20} style={{marginLeft: 8}} />
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20, // Increased height slightly for stacked logo
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  titleContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  headerTitleMain: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FF5E62', // Neon Orange/Pink
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: -4,
  },
  headerTitleSub: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
    fontStyle: 'italic',
    textShadowColor: '#A91079', // Pink glow
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 0,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  scrollContent: {
    paddingBottom: 50,
  },
  uploadContainer: {
    height: 220,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  uploadGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  uploadText: {
    color: '#EEE',
    fontSize: 16,
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  changeImageBadge: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  changeImageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 24,
    marginBottom: 15,
    color: '#FFF', 
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  gridItem: {
    width: '33.33%',
    padding: 6,
  },
  gridItemGradient: {
    height: 90,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  gridItemGradientSelected: {
    borderColor: 'rgba(255,255,255,0.5)',
    borderWidth: 2,
  },
  gridItemText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#CCC',
  },
  gridItemTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  generateButton: {
    marginHorizontal: 20,
    marginBottom: 30,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF512F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  resultsContainer: {
    paddingHorizontal: 20,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  intensifyContainer: {
    marginTop: 15,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FF512F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  intensifyGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  intensifyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
           chatBubble: {
             backgroundColor: '#007AFF', // iMessage Blue
             padding: 12, // Slightly tighter padding like iMessage
             paddingHorizontal: 16,
             borderRadius: 20,
             marginBottom: 10, // Closer spacing
             flexDirection: 'row',
             alignItems: 'center',
             justifyContent: 'space-between',
             alignSelf: 'flex-end', // Align to right side like user sent it (or just center if full width)
             maxWidth: '90%', // Don't span full width, look like a bubble
             shadowColor: '#000',
             shadowOffset: { width: 0, height: 1 },
             shadowOpacity: 0.1,
             shadowRadius: 2,
             elevation: 2,
           },
           chatBubbleText: {
             color: '#fff', // White text on Blue bubble
             fontSize: 16,
             lineHeight: 22,
             flex: 1,
             marginRight: 10,
             fontWeight: '400', // Standard weight
           },
           copyBadge: {
             backgroundColor: 'rgba(255,255,255,0.2)', // Semi-transparent white
             padding: 6,
             borderRadius: 12,
           }
});
