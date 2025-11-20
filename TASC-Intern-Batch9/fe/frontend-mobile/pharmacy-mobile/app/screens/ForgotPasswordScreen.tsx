import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { styles } from './ForgotPasswordScreen.styles';

type Step = 'email' | 'verification' | 'newPassword';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    code?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateEmail = () => {
    if (!email.trim()) {
      setErrors({ email: 'Vui lòng nhập email' });
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Email không hợp lệ' });
      return false;
    }
    return true;
  };

  const handleSendCode = async () => {
    if (!validateEmail()) return;

    setLoading(true);
    try {
      // TODO: Call API to send verification code
      console.log('Send code to:', email);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStep('verification');
      setErrors({});
    } catch (error) {
      console.error('Send code error:', error);
      setErrors({ email: 'Không tìm thấy email này trong hệ thống' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setErrors({ code: 'Vui lòng nhập mã xác nhận' });
      return;
    }
    if (verificationCode.length !== 6) {
      setErrors({ code: 'Mã xác nhận phải có 6 số' });
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API to verify code
      console.log('Verify code:', verificationCode);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStep('newPassword');
      setErrors({});
    } catch (error) {
      console.error('Verify code error:', error);
      setErrors({ code: 'Mã xác nhận không đúng' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const newErrors: typeof errors = {};

    if (!newPassword) {
      newErrors.password = 'Vui lòng nhập mật khẩu mới';
    } else if (newPassword.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API to reset password
      console.log('Reset password');
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Thành công',
        'Mật khẩu đã được đặt lại thành công',
        [
          {
            text: 'Đăng nhập',
            onPress: () => router.replace('/screens/LoginScreen'),
          },
        ]
      );
    } catch (error) {
      console.error('Reset password error:', error);
      Alert.alert('Lỗi', 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const renderEmailStep = () => (
    <>
      <View style={styles.iconContainer}>
        <Ionicons name="mail-outline" size={64} color={Colors.primary} />
      </View>
      <Text style={styles.title}>Quên mật khẩu?</Text>
      <Text style={styles.description}>
        Nhập email của bạn và chúng tôi sẽ gửi mã xác nhận để đặt lại mật khẩu
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
          <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="example@email.com"
            placeholderTextColor={Colors.textLight}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSendCode}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.surface} />
        ) : (
          <Text style={styles.buttonText}>Gửi mã xác nhận</Text>
        )}
      </TouchableOpacity>
    </>
  );

  const renderVerificationStep = () => (
    <>
      <View style={styles.iconContainer}>
        <Ionicons name="shield-checkmark-outline" size={64} color={Colors.primary} />
      </View>
      <Text style={styles.title}>Nhập mã xác nhận</Text>
      <Text style={styles.description}>
        Chúng tôi đã gửi mã gồm 6 số đến email {email}
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mã xác nhận</Text>
        <View style={[styles.inputWrapper, errors.code && styles.inputError]}>
          <Ionicons name="keypad-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="123456"
            placeholderTextColor={Colors.textLight}
            value={verificationCode}
            onChangeText={(text) => {
              setVerificationCode(text);
              if (errors.code) setErrors({ ...errors, code: undefined });
            }}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>
        {errors.code && <Text style={styles.errorText}>{errors.code}</Text>}
      </View>

      <TouchableOpacity
        style={styles.resendButton}
        onPress={handleSendCode}
      >
        <Text style={styles.resendText}>Gửi lại mã</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleVerifyCode}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.surface} />
        ) : (
          <Text style={styles.buttonText}>Xác nhận</Text>
        )}
      </TouchableOpacity>
    </>
  );

  const renderNewPasswordStep = () => (
    <>
      <View style={styles.iconContainer}>
        <Ionicons name="lock-closed-outline" size={64} color={Colors.primary} />
      </View>
      <Text style={styles.title}>Đặt mật khẩu mới</Text>
      <Text style={styles.description}>
        Mật khẩu mới phải khác với mật khẩu cũ
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mật khẩu mới</Text>
        <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
          <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={Colors.textLight}
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
            secureTextEntry={!showNewPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowNewPassword(!showNewPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Xác nhận mật khẩu</Text>
        <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
          <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={Colors.textLight}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
            }}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleResetPassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.surface} />
        ) : (
          <Text style={styles.buttonText}>Đặt lại mật khẩu</Text>
        )}
      </TouchableOpacity>
    </>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (step === 'email') {
                router.back();
              } else if (step === 'verification') {
                setStep('email');
              } else {
                setStep('verification');
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {step === 'email' && renderEmailStep()}
          {step === 'verification' && renderVerificationStep()}
          {step === 'newPassword' && renderNewPasswordStep()}
        </View>

        {/* Back to Login */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => router.push('/screens/LoginScreen')}>
            <Text style={styles.backToLoginText}>
              <Ionicons name="arrow-back-outline" size={14} />
              {' '}Quay lại đăng nhập
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
