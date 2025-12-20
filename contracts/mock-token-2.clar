;; SIP-010 mock token (second instance)
(impl-trait 'sip-010-trait-ft-standard.sip-010-trait)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))

;; No maximum supply!
(define-fungible-token Tony-token-2)

(define-data-var token-uri (optional (string-utf8 256)) none)

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
	(begin
		(asserts! (or (is-eq tx-sender sender) (is-eq contract-caller sender)) err-not-token-owner)
		(try! (ft-transfer? Tony-token-2 amount sender recipient))
		(match memo to-print (print to-print) 0x)
		(ok true)
	)
)

(define-read-only (get-name)
	(ok "Tony Token 2")
)

(define-read-only (get-symbol)
	(ok "TT2")
)

(define-read-only (get-decimals)
	(ok u6)
)

(define-read-only (get-balance (who principal))
	(ok (ft-get-balance Tony-token-2 who))
)

(define-read-only (get-total-supply)
	(ok (ft-get-supply Tony-token-2))
)

(define-read-only (get-token-uri)
	(ok (var-get token-uri))
)

(define-public (set-token-uri (uri (optional (string-utf8 256))))
	(begin
		(asserts! (is-eq tx-sender contract-owner) err-owner-only)
		(var-set token-uri uri)
		(ok true)
	)
)

(define-public (mint (amount uint) (recipient principal))
	(begin
		(asserts! (is-eq tx-sender contract-owner) err-owner-only)
		(ft-mint? Tony-token-2 amount recipient)
	)
)
