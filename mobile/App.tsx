import React, { useState, useRef } from 'react';
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
  Dimensions,
  TextInput,
  Modal,
  KeyboardAvoidingView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { Upload, Copy, Sparkles, Zap, Heart, Smile, Flame, Briefcase, Coffee, MessageCircle, X, Edit3, Plus, Cloud, Star, RefreshCw, Meh, Wine, Target, Frown, Sun, ThumbsUp, Skull, CircleOff, Angry, HeartCrack, Drama, Glasses, Brain, PartyPopper, Crown, Wand2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const TONES = [
  // Row 1
  { id: 'Professional', emoji: '💼', color: ['#1e3c72', '#2a5298'] },
  { id: 'Roast', emoji: '🔥', color: ['#ff416c', '#ff4b2b'] },
  { id: 'Flirty', emoji: '😏', color: ['#ff6b6b', '#ee5a24'] },
  { id: 'Sarcastic', emoji: '🙄', color: ['#4776E6', '#8E54E9'] },
  // Row 2
  { id: 'Dramatic', emoji: '👑', color: ['#f857a6', '#ff5858'] },
  { id: 'Brainrot', emoji: '🧠', color: ['#00d9ff', '#8b5cf6'] },
  { id: 'Empathetic', emoji: '🥺', color: ['#11998e', '#38ef7d'] },
  { id: 'Pickup Line', emoji: '😘', color: ['#f9d423', '#ff4e50'] },
  // Row 3
  { id: 'Drunk', emoji: '🍺', color: ['#7f00ff', '#e100ff'] },
  { id: 'Simp', emoji: '😩', color: ['#ff758c', '#ff7eb3'] },
  { id: 'Cringey', emoji: '😬', color: ['#fc4a1a', '#f7b733'] },
  { id: 'Custom', emoji: '✨', color: ['#c471ed', '#f64f59'] },
];

const API_URL = 'https://backend-one-amber-44.vercel.app';

interface ImageAsset {
  uri: string;
  base64: string;
}

export default function App() {
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [selectedTone, setSelectedTone] = useState<string>('Roast');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  
  // Context / Prompt State
  const [context, setContext] = useState('');

  const acceptDisclaimer = () => {
    setDisclaimerAccepted(true);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
      base64: false,
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1080 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      const newImage = {
        uri: manipResult.uri,
        base64: manipResult.base64 || ''
      };
      setImages([newImage]); // Single image only
      setSuggestions([]);
    }
  };

  const removeImage = () => {
    setImages([]);
  };

  const generateResponses = async (tone: string, notched: boolean = false) => {
    if (images.length === 0) {
      Alert.alert('No Image', 'Please upload at least one screenshot!');
      return;
    }

    // Always use the tone passed in - never rely on state
    setModalVisible(false);
    setLoading(true);
    setSuggestions([]); 

    try {
      console.log(`Generating with tone: ${tone}, notched: ${notched}`);
      
      const payload = {
        images: images.map(img => ({
          base64: img.base64,
          mediaType: img.uri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'
        })),
        context: tone === 'Custom' ? context.trim() : '', 
        tone: tone,
        notched: notched
      };
      
      const response = await axios.post(`${API_URL}/generate`, payload);

      console.log('Response received for tone:', tone);

      if (response.data && response.data.suggestions) {
        setSuggestions(response.data.suggestions);
        setModalVisible(true);
      } else {
        Alert.alert('Error', 'No suggestions received.');
      }
    } catch (error: any) {
      console.error("Full Error Object:", error);
      let errorMessage = 'Failed to connect to server.';
      
      if (error.response) {
        errorMessage = `Server Error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Network Error: Check internet connection.';
      } else {
        errorMessage = `Request Error: ${error.message}`;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const scrollViewRef = useRef<ScrollView>(null);

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied!', 'Response copied to clipboard.');
  };

  // Show disclaimer if not accepted
  if (!disclaimerAccepted) {
    return (
      <LinearGradient colors={['#2E0249', '#570A57', '#A91079']} style={styles.gradientContainer}>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
          <View style={styles.disclaimerScroll}>
            <View style={styles.disclaimerContent}>
              <Text style={styles.disclaimerTitle}>Quick Heads Up 👋</Text>
              
              <Text style={styles.disclaimerText}>
                AI-generated responses for entertainment. Your screenshots aren't stored. You're responsible for what you send. Some content may be spicy 🌶️
              </Text>

              <TouchableOpacity onPress={acceptDisclaimer} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#FF512F', '#DD2476']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.acceptButton}
                >
                  <Text style={styles.acceptButtonText}>Got it</Text>
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.disclaimerFooter}>
                For mature audiences (17+). By continuing, you agree to our terms.
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient 
      colors={['#2E0249', '#570A57', '#A91079']}
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

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{flex: 1}}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
          
          {/* Single Image Upload Area */}
          <View style={styles.uploadSection}>
            {images.length === 0 ? (
              <TouchableOpacity style={styles.uploadContainerMain} onPress={pickImage} activeOpacity={0.8}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.02)']}
                  style={styles.uploadGradient}
                >
                  <View style={styles.uploadPlaceholder}>
                    <View style={styles.iconCircle}>
                      <Upload color="#FFF" size={28} />
                    </View>
                    <Text style={styles.uploadText}>Tap to Upload Screenshot</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.singleImageContainer}>
                <TouchableOpacity onPress={pickImage} activeOpacity={0.9}>
                  <Image source={{ uri: images[0].uri }} style={styles.singleImage} resizeMode="contain" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.removeButtonSingle} onPress={removeImage}>
                  <X color="#fff" size={16} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Tone Selector */}
          <Text style={styles.sectionTitle}>Select Vibe</Text>
          <View style={styles.gridContainer}>
            {TONES.map((tone) => {
              const isSelected = selectedTone === tone.id;
              
              return (
                <TouchableOpacity
                  key={tone.id}
                  style={styles.gridItem}
                  onPress={() => {
                    // Reset everything when changing vibe
                    if (selectedTone !== tone.id) {
                      setSelectedTone(tone.id);
                      setSuggestions([]);
                      setModalVisible(false);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={isSelected ? tone.color : ['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)']}
                    style={[styles.gridItemGradient, isSelected && styles.gridItemGradientSelected]}
                  >
                    <Text style={styles.gridItemEmoji}>{tone.emoji}</Text>
                    <Text style={[styles.gridItemText, isSelected && styles.gridItemTextSelected]}>
                      {tone.id}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom Context Input - ONLY VISIBLE WHEN CUSTOM IS SELECTED */}
          {selectedTone === 'Custom' && (
             <View style={styles.contextSection}>
               <View style={styles.contextInputContainer}>
                 <View style={styles.contextHeader}>
                   <Text style={styles.contextLabel}>Custom Instructions:</Text>
                 </View>
                 <TextInput
                   style={styles.contextInput}
                   placeholder="Ex: 'I want to ask her out' or 'Make it sound like I'm busy'"
                   placeholderTextColor="#AAA"
                   value={context}
                   onChangeText={setContext}
                   multiline
                   maxLength={200}
                   onFocus={() => {
                     setTimeout(() => {
                       scrollViewRef.current?.scrollToEnd({ animated: true });
                     }, 300);
                   }}
                 />
               </View>
             </View>
          )}

          {/* Results Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                {/* Drag Handle */}
                <View style={styles.modalHandle} />
                
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>💬 Drafts</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                    <X color="#fff" size={20} />
                  </TouchableOpacity>
                </View>

                {selectedTone === 'Roast' && (
                  <View style={styles.roastDisclaimer}>
                    <Text style={styles.roastDisclaimerText}>
                      ⚠️ Heads up: This vibe contains swear words and can be ruthless. Use responsibly!
                    </Text>
                  </View>
                )}

                <ScrollView contentContainerStyle={styles.modalScroll}>
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
                  
                  {/* Take it up a notch Button */}
                  <TouchableOpacity 
                    style={styles.notchButton}
                    onPress={() => {
                      setModalVisible(false);
                      generateResponses(selectedTone, true);
                    }}
                    activeOpacity={0.8}
                  >
                    <Zap color="#fff" size={18} />
                    <Text style={styles.notchButtonText}>Take it up a notch 🔥</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </Modal>

        </ScrollView>
        
        {/* Sticky Generate Button */}
        <View style={styles.stickyButtonContainer}>
          <TouchableOpacity 
            onPress={() => generateResponses(selectedTone)}
            disabled={images.length === 0 || loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={(images.length === 0 || loading) ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] : ['#FF512F', '#DD2476']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.generateButton}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.btnContent}>
                  <Sparkles color={images.length === 0 ? '#AAA' : '#fff'} size={18} style={{marginRight: 8}} />
                  <Text style={[styles.generateButtonText, images.length === 0 && {color: '#AAA'}]}>
                    Generate Responses
                  </Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
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
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  titleContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  headerTitleMain: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FF5E62',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: -6,
  },
  headerTitleSub: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
    fontStyle: 'italic',
    textShadowColor: '#A91079',
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
    paddingBottom: 100, // Extra padding for sticky button
  },
  stickyButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  
  // Image Upload Styles
  uploadSection: {
    marginBottom: 15,
  },
  uploadContainerMain: {
    height: 250, // Medium upload height
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.08)', // Glassmorphism-ish / solid muted
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
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
    width: 55,
    height: 55,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 0,
  },
  uploadText: {
    color: '#EEE',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadSubText: {
    color: '#AAA',
    fontSize: 12,
    marginTop: 4,
  },
  singleImageContainer: {
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 15,
    position: 'relative',
  },
  singleImage: {
    width: width - 60,
    height: 380, // Medium height
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  removeButtonSingle: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  // Legacy styles (can be removed later)
  imageRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  thumbnailContainer: {
    width: 180,
    height: 390,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  addMoreButton: {
    width: 80,
    height: 390, // Match thumbnail height
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addMoreText: {
    color: '#rgba(255,255,255,0.8)',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },

  // Context Styles
  contextSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  contextInputContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  contextHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contextLabel: {
    color: '#AAA',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  contextInput: {
    color: '#fff',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 24,
    marginBottom: 12,
    color: '#FFF', 
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    marginBottom: 15,
  },
  gridItem: {
    width: '25%',
    padding: 2,
  },
  gridItemGradient: {
    height: 85,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  gridItemGradientSelected: {
    borderColor: '#fff',
    borderWidth: 2,
    shadowColor: '#fff',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  gridItemEmoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  gridItemText: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  gridItemTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  generateButton: {
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF512F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  memeButton: {
    height: '100%',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4facfe',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 30,
    justifyContent: 'space-between',
    height: 60, // Fixed height for alignment
  },
  memeContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  memeImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  memeHint: {
    color: '#AAA',
    fontSize: 12,
    marginTop: 8,
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
  escalationHint: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  chatBubble: {
    backgroundColor: '#007AFF',
    padding: 14,
    paddingHorizontal: 18,
    borderRadius: 22,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'flex-end',
    maxWidth: '95%',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  chatBubbleText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 21,
    flex: 1,
    marginRight: 12,
    fontWeight: '500',
  },
  copyBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 6,
    borderRadius: 12,
  },
  notchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF512F',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginTop: 16,
    marginBottom: 8,
    shadowColor: '#FF512F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  notchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0d0d0d',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 8,
    paddingHorizontal: 0,
    maxHeight: '88%',
    minHeight: '55%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,100,150,0.3)',
    shadowColor: '#FF0099',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 25,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 10,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  closeButton: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalScroll: {
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  roastDisclaimer: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: 'rgba(255,65,108,0.15)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,65,108,0.3)',
  },
  roastDisclaimerText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    textAlign: 'center',
  },
  // Disclaimer styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disclaimerScroll: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  disclaimerContent: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  disclaimerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  disclaimerText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 16,
  },
  acceptButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  disclaimerFooter: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    marginTop: 12,
  },
});
