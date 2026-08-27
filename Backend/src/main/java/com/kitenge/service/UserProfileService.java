package com.kitenge.service;

import com.kitenge.dto.UserAddressDto;
import com.kitenge.dto.UserNotificationsDto;
import com.kitenge.dto.UserPreferencesDto;
import com.kitenge.model.User;
import com.kitenge.model.UserAddress;
import com.kitenge.model.UserNotifications;
import com.kitenge.model.UserPreferences;
import com.kitenge.repository.UserAddressRepository;
import com.kitenge.repository.UserNotificationsRepository;
import com.kitenge.repository.UserPreferencesRepository;
import com.kitenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserProfileService {
    
    private final UserRepository userRepository;
    private final UserAddressRepository userAddressRepository;
    private final UserPreferencesRepository userPreferencesRepository;
    private final UserNotificationsRepository userNotificationsRepository;
    
    // Address Management
    public List<UserAddressDto> getUserAddresses(Long userId) {
        return userAddressRepository.findByUserId(userId)
                .stream()
                .map(this::convertToAddressDto)
                .collect(Collectors.toList());
    }
    
    public UserAddressDto addAddress(Long userId, UserAddressDto addressDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // If this is set as default, unset other defaults
        if (Boolean.TRUE.equals(addressDto.getIsDefault())) {
            userAddressRepository.findByUserIdAndIsDefaultTrue(userId)
                    .ifPresent(addr -> {
                        addr.setIsDefault(false);
                        userAddressRepository.save(addr);
                    });
        }
        
        UserAddress address = new UserAddress();
        address.setUser(user);
        address.setLabel(addressDto.getLabel());
        address.setStreet(addressDto.getStreet());
        address.setCity(addressDto.getCity());
        address.setCountry(addressDto.getCountry());
        address.setIsDefault(addressDto.getIsDefault() != null ? addressDto.getIsDefault() : false);
        
        UserAddress saved = userAddressRepository.save(address);
        return convertToAddressDto(saved);
    }
    
    public UserAddressDto updateAddress(Long userId, Long addressId, UserAddressDto addressDto) {
        UserAddress address = userAddressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        
        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        // If this is set as default, unset other defaults
        if (Boolean.TRUE.equals(addressDto.getIsDefault()) && !address.getIsDefault()) {
            userAddressRepository.findByUserIdAndIsDefaultTrue(userId)
                    .ifPresent(addr -> {
                        addr.setIsDefault(false);
                        userAddressRepository.save(addr);
                    });
        }
        
        address.setLabel(addressDto.getLabel());
        address.setStreet(addressDto.getStreet());
        address.setCity(addressDto.getCity());
        address.setCountry(addressDto.getCountry());
        address.setIsDefault(addressDto.getIsDefault() != null ? addressDto.getIsDefault() : false);
        
        UserAddress saved = userAddressRepository.save(address);
        return convertToAddressDto(saved);
    }
    
    public void deleteAddress(Long userId, Long addressId) {
        UserAddress address = userAddressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        
        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        userAddressRepository.delete(address);
    }
    
    // Preferences Management
    public UserPreferencesDto getUserPreferences(Long userId) {
    try {
    UserPreferences prefs = userPreferencesRepository.findByUserId(userId)
    .orElseGet(() -> createDefaultPreferences(userId));
    return convertToPreferencesDto(prefs);
    } catch (Exception e) {
    // Return default preferences if there's any error
    UserPreferences defaultPrefs = new UserPreferences();
    defaultPrefs.setLanguage("en");
    defaultPrefs.setCurrency("RWF");
    defaultPrefs.setTheme("system");
    defaultPrefs.setDateFormat("MM/DD/YYYY");
    defaultPrefs.setTimezone("Africa/Kigali");
    return convertToPreferencesDto(defaultPrefs);
    }
    }
    
    public UserPreferencesDto updateUserPreferences(Long userId, UserPreferencesDto preferencesDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserPreferences prefs = userPreferencesRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserPreferences newPrefs = new UserPreferences();
                    newPrefs.setUser(user);
                    return newPrefs;
                });
        
        if (preferencesDto.getLanguage() != null) prefs.setLanguage(preferencesDto.getLanguage());
        if (preferencesDto.getCurrency() != null) prefs.setCurrency(preferencesDto.getCurrency());
        if (preferencesDto.getTheme() != null) prefs.setTheme(preferencesDto.getTheme());
        if (preferencesDto.getDateFormat() != null) prefs.setDateFormat(preferencesDto.getDateFormat());
        if (preferencesDto.getTimezone() != null) prefs.setTimezone(preferencesDto.getTimezone());
        
        UserPreferences saved = userPreferencesRepository.save(prefs);
        return convertToPreferencesDto(saved);
    }
    
    private UserPreferences createDefaultPreferences(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserPreferences prefs = new UserPreferences();
        prefs.setUser(user);
        prefs.setLanguage("en");
        prefs.setCurrency("RWF");
        prefs.setTheme("system");
        prefs.setDateFormat("MM/DD/YYYY");
        prefs.setTimezone("Africa/Kigali");
        
        return userPreferencesRepository.save(prefs);
    }
    
    // Notifications Management
    public UserNotificationsDto getUserNotifications(Long userId) {
        UserNotifications notifs = userNotificationsRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultNotifications(userId));
        return convertToNotificationsDto(notifs);
    }
    
    public UserNotificationsDto updateUserNotifications(Long userId, UserNotificationsDto notificationsDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserNotifications notifs = userNotificationsRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserNotifications newNotifs = new UserNotifications();
                    newNotifs.setUser(user);
                    return newNotifs;
                });
        
        if (notificationsDto.getEmailOrderUpdates() != null) 
            notifs.setEmailOrderUpdates(notificationsDto.getEmailOrderUpdates());
        if (notificationsDto.getEmailPromotions() != null) 
            notifs.setEmailPromotions(notificationsDto.getEmailPromotions());
        if (notificationsDto.getEmailNewsletters() != null) 
            notifs.setEmailNewsletters(notificationsDto.getEmailNewsletters());
        if (notificationsDto.getSmsOrderUpdates() != null) 
            notifs.setSmsOrderUpdates(notificationsDto.getSmsOrderUpdates());
        if (notificationsDto.getSmsPromotions() != null) 
            notifs.setSmsPromotions(notificationsDto.getSmsPromotions());
        
        UserNotifications saved = userNotificationsRepository.save(notifs);
        return convertToNotificationsDto(saved);
    }
    
    private UserNotifications createDefaultNotifications(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserNotifications notifs = new UserNotifications();
        notifs.setUser(user);
        notifs.setEmailOrderUpdates(true);
        notifs.setEmailPromotions(true);
        notifs.setEmailNewsletters(false);
        notifs.setSmsOrderUpdates(false);
        notifs.setSmsPromotions(false);
        
        return userNotificationsRepository.save(notifs);
    }
    
    // Conversion methods
    private UserAddressDto convertToAddressDto(UserAddress address) {
        return new UserAddressDto(
                address.getId(),
                address.getLabel(),
                address.getStreet(),
                address.getCity(),
                address.getCountry(),
                address.getIsDefault()
        );
    }
    
    private UserPreferencesDto convertToPreferencesDto(UserPreferences prefs) {
        return new UserPreferencesDto(
                prefs.getId(),
                prefs.getLanguage(),
                prefs.getCurrency(),
                prefs.getTheme(),
                prefs.getDateFormat(),
                prefs.getTimezone()
        );
    }
    
    private UserNotificationsDto convertToNotificationsDto(UserNotifications notifs) {
        return new UserNotificationsDto(
                notifs.getId(),
                notifs.getEmailOrderUpdates(),
                notifs.getEmailPromotions(),
                notifs.getEmailNewsletters(),
                notifs.getSmsOrderUpdates(),
                notifs.getSmsPromotions()
        );
    }
}
