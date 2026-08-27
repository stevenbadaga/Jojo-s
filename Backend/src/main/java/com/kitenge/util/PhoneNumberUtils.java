package com.kitenge.util;

public final class PhoneNumberUtils {
    private PhoneNumberUtils() {
    }

    public static String normalizePhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return null;
        }
        String cleanPhone = phoneNumber.replaceAll("[^0-9+]", "");
        if (cleanPhone.isEmpty()) {
            return null;
        }

        if (cleanPhone.startsWith("+")) {
            cleanPhone = cleanPhone.substring(1);
        }
        if (cleanPhone.startsWith("0")) {
            cleanPhone = "250" + cleanPhone.substring(1);
        } else if (!cleanPhone.startsWith("250") && cleanPhone.length() == 9) {
            cleanPhone = "250" + cleanPhone;
        }

        return cleanPhone;
    }
}
