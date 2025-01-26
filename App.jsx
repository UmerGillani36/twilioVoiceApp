import React, {useEffect, useState} from 'react';
import {View, Text, Button, PermissionsAndroid, Platform} from 'react-native';
import Voice from '@twilio/voice-sdk';
import {request, PERMISSIONS} from 'react-native-permissions';

const CallScreen = () => {
  const [callState, setCallState] = useState('Waiting for a call...');
  const [voice, setVoice] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      // Request permissions
      if (Platform.OS === 'android') {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.INTERNET,
        ]);
      } else {
        await request(PERMISSIONS.IOS.MICROPHONE);
      }

      // Get Twilio Access Token
      const response = await fetch('https://your-ngrok-url.ngrok.io/token');
      const {token} = await response.json();

      // Initialize Twilio Voice SDK
      const voiceInstance = new Voice(token);
      setVoice(voiceInstance);

      // Listen for incoming calls
      voiceInstance.on('incoming', call => {
        setCallState('Incoming call...');
        call.on('accept', () => setCallState('Call in progress...'));
        call.on('disconnect', () => setCallState('Call ended.'));
        call.on('reject', () => setCallState('Call rejected.'));
      });
    };

    initialize();

    return () => {
      voice?.destroy();
    };
  }, []);

  const answerCall = () => {
    const call = voice.activeCall;
    if (call) call.accept();
  };

  const endCall = () => {
    const call = voice.activeCall;
    if (call) call.disconnect();
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>{callState}</Text>
      {callState === 'Incoming call...' && (
        <Button title="Answer Call" onPress={answerCall} />
      )}
      {(callState === 'Call in progress...' ||
        callState === 'Incoming call...') && (
        <Button title="End Call" onPress={endCall} />
      )}
    </View>
  );
};

export default CallScreen;
