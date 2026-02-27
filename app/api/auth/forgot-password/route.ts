import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import PasswordReset from '@/models/PasswordReset';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        console.log('🔍 Password reset requested for:', email);

        await dbConnect();

        const user = await User.findOne({ email });

        if (!user) {
            console.log('⚠️ User not found, but returning generic message');
            // Don't reveal if user exists for security
            return NextResponse.json({
                message: 'If an account with that email exists, a password reset link has been sent.'
            });
        }

        console.log('✅ User found:', user.name, 'ID:', user._id);

        // Generate reset token (plain token, not hashed)
        const resetToken = crypto.randomBytes(32).toString('hex');

        console.log('🔑 Generated reset token (first 10 chars):', resetToken.substring(0, 10));

        // Delete any existing reset tokens for this user
        const deletedCount = await PasswordReset.deleteMany({ userId: user._id });
        console.log('🗑️ Deleted', deletedCount.deletedCount, 'old reset token(s)');

        // Create new password reset record
        const resetRecord = await PasswordReset.create({
            userId: user._id,
            token: resetToken
        });

        console.log('💾 Password reset record created');
        console.log('   - Record ID:', resetRecord._id);
        console.log('   - User ID:', resetRecord.userId);
        console.log('   - Token (first 10):', resetRecord.token.substring(0, 10));
        console.log('   - Expires at:', resetRecord.expiresAt);

        // Create reset URL
        const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;

        console.log('📧 Attempting to send email via Resend...');
        console.log('From:', process.env.RESEND_FROM_EMAIL);
        console.log('To:', email);

        // Send email via Resend
        const emailResult = await resend.emails.send({
            from: 'info@nyamekyeloans.com',
            to: email,
            subject: 'Password Reset - RiskWhiz',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">Password Reset Request</h2>
                    <p>Hi ${user.name},</p>
                    <p>You requested a password reset for your RiskWhiz account.</p>
                    <p>Click the button below to reset your password:</p>
                    <a href="${resetUrl}" 
                       style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
                        Reset Password
                    </a>
                    <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
                    <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
                    <hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;">
                    <p style="color: #999; font-size: 12px;">Or copy and paste this link: ${resetUrl}</p>
                </div>
            `,
        });

        console.log('✅ Email sent!', emailResult);

        return NextResponse.json({
            message: 'If an account with that email exists, a password reset link has been sent.'
        });
    } catch (error: any) {
        console.error('❌ Forgot password error:', error);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        return NextResponse.json({
            error: 'Failed to process request. Please check server logs.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}
