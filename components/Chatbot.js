import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useWeather } from '../context/WeatherContext';
import { getAllMainChapters } from '../api/apiService';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AppText from './AppText';

// -------------------- CONSTANTS --------------------
const faq = [
  { q: ['γεια'], a: 'Γεια σας! Πώς μπορώ να βοηθήσω;' },
  { q: ['προορισμοί', 'προορισμούς', 'προορισμο'], a: 'Δείτε τους προορισμούς στη σχετική σελίδα.' },
  { q: ['διαδρομές', 'διαδρομή'], a: 'Οι διαδρομές εμφανίζονται στη σελίδα Διαδρομές.' },
  { q: ['οικισμοι'], a: 'Οι οικισμοί εμφανίζονται στη σελίδα Οικισμοί.' },
  { q: ['αρχαιολογικοι χωροι'], a: 'Οι αρχαιολογικοί χώροι είναι διαθέσιμοι στην αντίστοιχη ενότητα.' },
  { q: ['πεζοπορία', 'πεζοπορια'], a: 'Ανακαλύψτε διαδρομές πεζοπορίας στη σχετική ενότητα.' },
  { q: ['ποδηλασία', 'ποδηλασια'], a: 'Η ποδηλασία περιλαμβάνεται στους θεματικούς προορισμούς.' },
  { q: ['λαϊκή τέχνη', 'λαικη τεχνη'], a: 'Δείτε τη λαϊκή τέχνη στην αντίστοιχη σελίδα.' },
  { q: ['εκκλησίες', 'μοναστήρια'], a: 'Οι εκκλησίες και τα μοναστήρια παρουσιάζονται αναλυτικά.' },
  { q: ['θεματικες'], a: 'Δείτε τις θεματικές ενότητες στον ιστότοπο.' },
  { q: ['καλες τεχνες'], a: 'Οι καλές τέχνες περιλαμβάνονται στους θεματικούς προορισμούς.' },
  // English support
  { q: ['hello', 'hi'], a: 'Hello! How can I help you?' },
  { q: ['destinations'], a: 'See the destinations on the relevant page.' },
  { q: ['routes', 'route'], a: 'Routes are shown on the Routes page.' },
  { q: ['villages'], a: 'Villages are shown on the Villages page.' },
  { q: ['archaeological sites'], a: 'Archaeological sites are available in the corresponding section.' },
  { q: ['hiking'], a: 'Discover hiking routes in the relevant section.' },
  { q: ['cycling'], a: 'Cycling is included in the thematic destinations.' },
  { q: ['folk art'], a: 'See folk art on the corresponding page.' },
  { q: ['churches', 'monasteries'], a: 'Churches and monasteries are presented in detail.' },
  { q: ['themes', 'thematic'], a: 'See the thematic sections on the website.' },
  { q: ['fine arts'], a: 'Fine arts are included in the thematic destinations.' },
];


const chapterKeywords = ['προορισμ', 'διαδρομ', 'destinat', 'rout'];
const storyboardKeywords = [
  'οικισμ', 'αρχαιολογ', 'λαικη τεχνη', 'εκκλησ', 'μοναστ', 'θαλασσ', 'παρκ',
  'καλες τεχν', 'καλλιτεχν', 'καλες', 'παραλι', 'πεζοπορ', 'ποδηλασ', 'θεματικ',
  // English
  'village', 'archaeolog', 'folk art', 'church', 'monaster', 'sea', 'park',
  'fine art', 'art', 'beach', 'hiking', 'cycling', 'thematic'
];
const weatherKeywords = [
  'καιρός', 'καιρο', 'καιρι', 'weather', 'βρέχει', 'βρεχει', 'ζέστη', 'rain', 'hot', 'cold', 'temperature'
].map(normalizeGreek);

function normalizeGreek(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '');
}

// -------------------- COMPONENT --------------------
export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([
  { from: 'bot', text: i18n.language === 'en'
      ? "Hello! Ask a question or choose one of the options below."
      : "Γεια σας! Κάντε μια ερώτηση ή επιλέξτε μία από τις παρακάτω επιλογές."
  },
]);
  const [input, setInput] = useState('');
  const [chapters, setChapters] = useState([]);
  const scrollRef = useRef();
  const navigation = useNavigation();
  const weather = useWeather();

  const quickReplies = [t('hi'), t('destinations'), t('trails'), t('events')];

  useEffect(() => {
    getAllMainChapters(i18n.language).then(setChapters);
  }, [i18n.language]);

  const handleSend = async (msg) => {
    const userRaw = msg || input;
    const userMsg = normalizeGreek(userRaw.trim());
    if (!userMsg) return;

    setMessages(prev => [...prev, { from: 'user', text: userRaw }]);

    if (weatherKeywords.some(k => userMsg.includes(k))) {
      const current = weather?.current;
      setMessages(prev => [...prev, {
        from: 'bot',
        text: current
          ? (i18n.language === 'en'
              ? `The weather in Skopelos is ${current.condition.text}, temperature ${Math.round(current.temp_c)}°C, feels like ${Math.round(current.feelslike_c)}°C.`
              : `Ο καιρός στη Σκόπελο είναι ${current.condition.text}, θερμοκρασία ${Math.round(current.temp_c)}°C, αισθητή ${Math.round(current.feelslike_c)}°C.`)
          : (i18n.language === 'en'
              ? "I can't retrieve the weather right now."
              : 'Δεν μπορώ να ανακτήσω τον καιρό αυτή τη στιγμή.'),
      }]);
      setInput('');
      return;
    }

    if (handleNavigation(userMsg)) {
      setInput('');
      return;
    }

    const foundFaq = faq.find(entry =>
      entry.q.some(keyword => userMsg.includes(normalizeGreek(keyword)))
    );

    setMessages(prev => [...prev, {
      from: 'bot',
      text: foundFaq
        ? foundFaq.a
        : (i18n.language === 'en'
            ? "Sorry, I don't know the answer."
            : 'Συγγνώμη, δεν γνωρίζω την απάντηση.'),
    }]);
    setInput('');
  };

  const handleNavigation = (userMsg) => {
    for (const keyword of chapterKeywords) {
      if (userMsg.includes(normalizeGreek(keyword))) {
        const match = chapters.find(ch =>
          normalizeGreek(ch.attributes.title).includes(normalizeGreek(keyword))
        );
        if (match) {
          setTimeout(() => navigation.navigate('MainChapters', { id: match.id }), 1200);
          return true;
        }
      }
    }

    if (['εκδηλ', 'πανηγυρ', 'event'].some(k => userMsg.includes(normalizeGreek(k)))) {
      setTimeout(() => navigation.navigate('Events'), 1200);
      return true;
    }

    for (const chapter of chapters) {
      const storyboards = chapter.attributes.mainStoryboards?.data || [];
      for (const sb of storyboards) {
        const sbTitle = normalizeGreek(sb.attributes.title);
        for (const keyword of storyboardKeywords) {
          if (userMsg.includes(normalizeGreek(keyword)) && sbTitle.includes(normalizeGreek(keyword))) {
            navigation.navigate('StoryboardDetails', {
              id: sb.id,
              chapterId: chapter.id,
            });
            return true;
          }
        }
      }
    }

    return false;
  };

  return (
    <>
      {!open && (
        <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.fab} onPress={() => setOpen(true)}>
            <Ionicons name="chatbubble-ellipses-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {open && (
        <View style={styles.chatContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoidingView}
            keyboardVerticalOffset={25}
          >
            <View style={styles.fullscreenChatBox}>
              <ScrollView
                ref={scrollRef}
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
                style={styles.messageArea}
              >
                {messages.map((msg, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.message,
                      msg.from === 'user' ? styles.userMessage : styles.botMessage,
                    ]}
                  >
                    <AppText style={styles.messageText}>
                      <AppText style={styles.sender}>{msg.from === 'bot' ? (i18n.language === 'en' ? 'Bot: ' : 'Bot: ') : (i18n.language === 'en' ? 'You: ' : 'Εσείς: ')}</AppText>
                      {msg.text}
                    </AppText>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.quickReplies}>
                {quickReplies.map((reply, idx) => (
                  <TouchableOpacity key={idx} style={styles.chip} onPress={() => handleSend(reply)}>
                    <AppText style={styles.chipText}>{reply}</AppText>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.inputArea}>
                <TextInput
                  style={styles.input}
                  value={input}
                  placeholder={i18n.language === 'en' ? "Type here..." : "Γράψτε εδώ..."}
                  onChangeText={setInput}
                  onSubmitEditing={() => handleSend(input)}
                />
                <TouchableOpacity onPress={() => handleSend(input)} style={styles.sendButton}>
                  <AppText style={styles.sendText}>Send</AppText>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={() => setOpen(false)} style={styles.closeButton}>
                <AppText style={styles.closeText}>{i18n.language === 'en' ? "Close" : "Κλείσιμο"}</AppText>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}
    </>
  );
}

// -------------------- STYLES --------------------
const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 94,
    right: 24,
    zIndex: 999,
  },
  chatContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    bottom: 50,
    zIndex: 999,
  },
  keyboardAvoidingView: {
    flex: 1,
    width: '100%',
  },
  fullscreenChatBox: {
    flex: 1,
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    padding: 22,
    borderWidth: 10,
    borderColor: '#1a365d',
  },
  fab: {
    backgroundColor: '#7daff5ff',
    borderRadius: 50,
    padding: 16,
    alignSelf: 'flex-end',
    elevation: 5,
  },
  chatWrapper: {
    flex: 1,
  },
  chatBox: {
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 4,
    borderColor: '#1a365d',
    maxHeight: 600,
  },
  messageArea: {
    flex: 1, 
    marginBottom: 8,
  },
  message: {
    marginBottom: 6,
    padding: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#7daff5ff',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3ecf7',
  },
  messageText: {
    color: '#222',
    fontFamily:'Inter-Variable',
    fontSize:16
    
  },
  sender: {
    fontWeight: 'bold',
    fontFamily:'Inter-Variable'
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderColor: '#1a365d',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  sendButton: {
    backgroundColor: '#1a365d',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  sendText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily:'Inter-Variable'
  },
  closeButton: {
    marginTop: 10,
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#e3ecf7',
    borderRadius: 10,
  },
  closeText: {
    color: '#1a365d',
    fontWeight: 'bold',
    fontFamily:'Inter-Variable'
  },
  quickReplies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  chip: {
    borderColor: '#1a365d',
    borderWidth: 1,
    backgroundColor: '#fff',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 6,
  },
  chipText: {
    color: '#1a365d',
    fontWeight: '600',
    fontFamily:'Inter-Variable'
  },
});