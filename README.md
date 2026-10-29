# Private Text Expander

**Chromium tarayıcılar için hafif, gizlilik odaklı bir metin genişletme eklentisi.**

Sık kullandığın metinler için özel kısayollar oluştur, yazma sürecini hızlandır ve tekrarlayan metinleri tek bir tetikleyiciyle genişlet. E-posta adresleri, imzalar, sık kullanılan yanıtlar ve diğer metinler için pratik bir çözüm.

Hesap oluşturma yok. Harici sunucu yok. Üçüncü taraf bağımlılığı yok. Yalnızca ihtiyacın olan özellikler.

## ✨ Özellikler

- **Hızlı metin genişletme:** Kısa tetikleyicileri daha uzun metinlere dönüştür.
- **Özelleştirilebilir tetikleyici öneki:** `:`, `;` veya `//` gibi kendi önekini belirle.
- **Kolay kısayol yönetimi:** Kısayollarını oluştur, düzenle ve sil.
- **Açık ve koyu tema:** Arayüz görünümünü tercihlerine göre değiştir.
- **JSON ile yedekleme:** Kısayollarını dışa aktar ve daha sonra yeniden içe aktar.
- **Gizlilik odaklı tasarım:** Kısayol verileri tarayıcının yerel depolama alanında tutulur.
- **Hafif ve bağımsız:** Harici kütüphane, üçüncü taraf bağımlılığı veya arka uç sunucusu gerektirmez.
- **Sade kullanıcı arayüzü:** Kısayol sayısı arttığında liste kendi içinde kaydırılır; düzenleme alanına erişim kolay kalır.

## 🖥️ Nasıl çalışır?

Tekrar tekrar yazdığın metinler için kısayollar tanımlarsın. Ardından desteklenen bir metin alanında kısayolu yazıp boşluk, Enter veya Tab tuşuna bastığında eklenti, eşleşen metni tanımladığın içerikle değiştirir.

Örneğin:

| Tetikleyici | Genişletilen metin                                           |
| ----------- | ------------------------------------------------------------ |
| `:mail`     | `ornek@eposta.com`                                           |
| `:tesekkur` | `Mesajınız için teşekkür ederim.`                            |
| `:toplanti` | `Toplantı için uygun olduğunuz zamanı paylaşabilir misiniz?` |
| `:imza`     | `İyi çalışmalar.`                                            |

Bunlar yalnızca örnektir. Kendi tetikleyicilerini ve metinlerini oluşturabilirsin.

## 📦 Kurulum

1. Bu depoyu bilgisayarına indir veya Git ile klonla.
2. Chrome'da `chrome://extensions` adresini aç.
3. Sağ üst köşeden **Geliştirici modu** seçeneğini etkinleştir.
4. **Paketlenmemiş öğe yükle** düğmesine tıkla.
5. Projenin `manifest.json` dosyasını içeren klasörünü seç.
6. Eklenti tarayıcıya eklendiğinde araç çubuğundan açabilirsin.

## 🚀 Kullanım

### 1. Kısayol oluştur

1. Tarayıcı araç çubuğundan **Private Text Expander** eklentisini aç.
2. Kısayollar sekmesindeki tetikleyici alanına bir kısayol gir.
3. Genişletilecek metni yaz.
4. **Kaydet** düğmesine tıkla.

Örnek:

- Tetikleyici: `:merhaba`
- Metin: `Merhaba, size nasıl yardımcı olabilirim?`

### 2. Kısayolu kullan

Kısayolun çalışmasını istediğin desteklenen metin alanına git. `:merhaba` yaz ve ardından boşluk, Enter veya Tab tuşuna bas.

Eklenti, eşleşen kısayolu tanımladığın metinle değiştirmeye çalışır.

**Önemli:** Bazı web siteleri, özel metin alanları ve uygulamalar farklı klavye veya giriş davranışları kullanabilir. Bu nedenle her alanda aynı şekilde çalışması garanti edilmez.

### 3. Tetikleyici önekini değiştir

Ayarlar sekmesinden tetikleyici önekini değiştirebilirsin.

Örneğin `:` yerine `;` seçersen, kısayolların `;mail` veya `;merhaba` gibi kullanılır.

Önek değiştirildiğinde mevcut kısayollar yeni önekle uyumlu hâle getirilir.

### 4. Görünümü özelleştir

Ayarlar bölümünden açık veya koyu temayı seçebilirsin.

### 5. Kısayollarını yedekle

- **Dışa aktar:** Kısayollarını JSON dosyasına kaydeder.
- **İçe aktar:** Daha önce dışa aktardığın JSON yedeğini yükler.

Düzenli yedek almak, tarayıcı profilini değiştirdiğinde veya eklentiyi başka bir cihaza taşırken faydalı olabilir.

## 🔒 Gizlilik

Private Text Expander, gizlilik odaklı bir yaklaşımla geliştirilmiştir.

- Kullanıcı hesabı veya kayıt işlemi gerektirmez.
- Bir arka uç sunucusuna ihtiyaç duymaz.
- Kısayol verileri `chrome.storage.local` aracılığıyla tarayıcının yerel uzantı depolama alanında tutulur.
- Projede üçüncü taraf JavaScript bağımlılıkları kullanılmaz.

**Güvenlik notu:** Yerel depolama, verilerin otomatik olarak şifrelendiği anlamına gelmez. Hassas bilgiler içeren kısayollar oluştururken cihazının ve tarayıcı profilinin güvenliğini göz önünde bulundur.

## 🛠️ Geliştiriciler için

### Gereksinimler

- Chromium tabanlı bir tarayıcı
- Manifest V3 destekleyen bir tarayıcı
- JavaScript, HTML ve CSS desteği

Node.js, paket yöneticisi veya derleme aracı gerekmez.

### Proje yapısı

```text
private-text-expander/
├── manifest.json
├── popup.html
├── popup.js
├── content.js
└── README.md
```

| Dosya           | Sorumluluk                                                                 |
| --------------- | -------------------------------------------------------------------------- |
| `manifest.json` | Eklenti tanımı, izinler ve içerik betiği yapılandırması                    |
| `popup.html`    | Kullanıcı arayüzü, stiller ve ayarlar                                      |
| `popup.js`      | Kısayol yönetimi, yerel depolama, tema ve JSON içe/dışa aktarma            |
| `content.js`    | Desteklenen metin alanlarında tetikleyicileri algılama ve metin genişletme |
| `README.md`     | Proje belgeleri ve kullanım rehberi                                        |

### Mimari

Eklenti, tarayıcı uzantılarının yerleşik API'lerini kullanır:

- **Popup arayüzü:** Kullanıcının kısayollarını ve tercihlerini yönetmesini sağlar.
- **Yerel depolama:** Kısayolları ve ayarları `chrome.storage.local` ile saklar.
- **İçerik betiği:** Sayfalardaki desteklenen metin girişlerini izler ve eşleşen tetikleyicileri genişletir.
- **Depolama değişiklikleri:** Ayarlardaki ve kısayollardaki değişikliklerin içerik betiğine aktarılmasını sağlar.

### Geliştirme ve test

1. Depoyu klonla.
2. Tarayıcının uzantı yönetimi sayfasından geliştirici modunu aç.
3. Proje klasörünü paketlenmemiş eklenti olarak yükle.
4. `popup.html` ve `popup.js` değişikliklerini test etmek için popup'ı yeniden aç.
5. `content.js` veya `manifest.json` değişikliklerinden sonra eklentiyi yeniden yükle ve test sayfasını yenile.
6. Aşağıdaki senaryoları kontrol et:
   - Kısayol oluşturma, düzenleme ve silme
   - Farklı tetikleyici önekleri
   - Boşluk, Enter ve Tab ile genişletme
   - Açık ve koyu tema
   - JSON dışa aktarma ve içe aktarma
   - Boş veya hatalı yedek dosyaları
   - Uzun kısayol listelerinde arayüzün kullanılabilirliği

## 🤝 Katkıda bulunma

Projeye katkıda bulunmak istersen:

1. Depoyu forklayarak kendi kopyanı oluştur.
2. Yeni bir dal aç.
3. Değişikliklerini yap ve test et.
4. Açıklayıcı bir commit mesajıyla değişikliklerini kaydet.
5. Pull request gönder.

Hata bildirimlerinde mümkünse tarayıcı sürümünü, yeniden oluşturma adımlarını ve konsol hata mesajlarını paylaş. Gizli veya kişisel bilgilerini hata raporlarına ekleme.

## 📄 Lisans

GNU General Public License v3.0 (GPL-3.0) kapsamında lisanslanmıştır.

Bu lisans kapsamında yazılımı özgürce kullanabilir, inceleyebilir, değiştirebilir ve dağıtabilirsin. Lisansın koşulları doğrultusunda dağıtılan değiştirilmiş sürümlerin de ilgili GPL yükümlülüklerine uyması gerekir.
Lisansın tam metni için depodaki LICENSE dosyasına bakabilirsin.
