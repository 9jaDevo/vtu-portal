@@ .. @@
   userDiscount: number;
   providerResponse: any;
-  cashbackPercentage: number;
   type: string;
 }) {
@@ .. @@
       userDiscount, 
       providerResponse, 
-      cashbackPercentage, 
       type 
     } = params;
     
-    // Calculate commission and cashback
-    const commissionEarned = providerResponse.commission_earned || 0;
-    const cashbackAmount = (commissionEarned * cashbackPercentage) / 100;
-    const netAmount = finalAmount - cashbackAmount; // User's net cost
-    
     // Update transaction with provider response
     const { supabase } = await import('../lib/supabase.js');
@@ .. @@
           status: providerResponse.status,
           description: providerResponse.message,
-          user_discount: cashbackAmount,
-          total_amount: netAmount,
+          user_discount: userDiscount,
+          total_amount: finalAmount,
           updated_at: new Date().toISOString()
         })
         .eq('id', transactionId);
     }
-    
-    // Credit user wallet with cashback if transaction was successful and cashback > 0
-    if (providerResponse.status === 'success' && cashbackAmount > 0) {
-      // Update wallet balance
-      const currentBalanceAfterDebit = walletBalance - finalAmount;
-      const newBalanceWithCashback = currentBalanceAfterDebit + cashbackAmount;
-      
-      await updateWallet(userId, newBalanceWithCashback);
-
-      // Log cashback transaction
-      const cashbackTransactionId = uuidv4();
-      const cashbackWalletTransactionData = {
-        id: cashbackTransactionId,
-        wallet_id: wallet.id,
-        user_id: userId,
-        type: 'credit',
-        amount: cashbackAmount,
-        balance_before: currentBalanceAfterDebit,
-        balance_after: newBalanceWithCashback,
-        reference: `CASHBACK_${externalReference}`,
-        description: `Cashback from ${type} transaction`
-      };
-
-      await createWalletTransaction(cashbackWalletTransactionData);
-
-      logger.info('Cashback credited to user wallet', {
-        transactionId,
-        userId,
-        cashbackAmount,
-        commissionEarned,
-        cashbackPercentage
-      });
-    }
   } catch (error) {
     logger.error('Error handling transaction success', {