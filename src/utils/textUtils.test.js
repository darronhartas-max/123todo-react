import React from 'react';
import { isValidPhoneNumber, sanitizePhoneHref, renderActionableText } from './textUtils';

describe('textUtils', () => {
    describe('isValidPhoneNumber', () => {
        test('recognizes standard phone formats', () => {
            expect(isValidPhoneNumber('+1 (555) 123-4567')).toBe(true);
            expect(isValidPhoneNumber('07123 456789')).toBe(true);
            expect(isValidPhoneNumber('+44 20 7946 0919')).toBe(true);
            expect(isValidPhoneNumber('555-123-4567')).toBe(true);
            expect(isValidPhoneNumber('01234567890')).toBe(true);
        });

        test('rejects dates and non-phone numbers', () => {
            expect(isValidPhoneNumber('2026-09-08')).toBe(false);
            expect(isValidPhoneNumber('08/09/2026')).toBe(false);
            expect(isValidPhoneNumber('12345')).toBe(false); // only 5 digits
            expect(isValidPhoneNumber('0000000000')).toBe(false); // repeated single digit
            expect(isValidPhoneNumber('')).toBe(false);
            expect(isValidPhoneNumber(null)).toBe(false);
        });
    });

    describe('sanitizePhoneHref', () => {
        test('cleans phone numbers and keeps leading plus', () => {
            expect(sanitizePhoneHref('+1 (555) 123-4567')).toBe('+15551234567');
            expect(sanitizePhoneHref('07123 456789')).toBe('07123456789');
            expect(sanitizePhoneHref('+44 20 7946 0919')).toBe('+442079460919');
        });
    });

    describe('renderActionableText', () => {
        test('returns raw value for non-strings or empty text', () => {
            expect(renderActionableText('')).toBe('');
            expect(renderActionableText(null)).toBe(null);
            expect(renderActionableText(undefined)).toBe(undefined);
        });

        test('returns plain string if no actionable items found', () => {
            const plain = 'Just a simple task title with 123 points on 2026-09-08';
            expect(renderActionableText(plain)).toBe(plain);
        });

        test('renders clickable email addresses with mailto:', () => {
            const res = renderActionableText('Contact john.doe@example.com for help');
            expect(Array.isArray(res)).toBe(true);
            // Should contain a link element
            const link = res.find(el => el && el.props && el.props.href === 'mailto:john.doe@example.com');
            expect(link).toBeDefined();
            expect(link.props.children).toBe('john.doe@example.com');
        });

        test('renders clickable phone numbers with tel:', () => {
            const res = renderActionableText('Call doctor at +1 (555) 123-4567 tomorrow');
            expect(Array.isArray(res)).toBe(true);
            const link = res.find(el => el && el.props && el.props.href === 'tel:+15551234567');
            expect(link).toBeDefined();
            expect(link.props.children).toBe('+1 (555) 123-4567');
        });

        test('renders clickable URLs with target="_blank"', () => {
            const res = renderActionableText('Check out https://www.123todo.com today');
            expect(Array.isArray(res)).toBe(true);
            const link = res.find(el => el && el.props && el.props.href === 'https://www.123todo.com');
            expect(link).toBeDefined();
            expect(link.props.target).toBe('_blank');
        });

        test('renders mixed text with email, phone, and website seamlessly', () => {
            const res = renderActionableText('Email test@123todo.com or call 07123 456789 or visit https://123todo.com');
            expect(Array.isArray(res)).toBe(true);
            const email = res.find(el => el && el.props && el.props.href === 'mailto:test@123todo.com');
            const phone = res.find(el => el && el.props && el.props.href === 'tel:07123456789');
            const url = res.find(el => el && el.props && el.props.href === 'https://123todo.com');
            expect(email).toBeDefined();
            expect(phone).toBeDefined();
            expect(url).toBeDefined();
        });
    });
});
