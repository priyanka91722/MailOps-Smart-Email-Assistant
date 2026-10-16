package com.mailops.email;

public record EmailReplyResponse(String reply, String status) {
    public static EmailReplyResponse success(String reply) {
        return new EmailReplyResponse(reply, "success");
    }
}
