import sys

with open('/Users/dylanj/projects/ventures/Baseify/web/index.html', 'r') as f:
    lines = f.readlines()

out = []
skip = False
for i, line in enumerate(lines):
    if '<section class="hero-tradie"' in line:
        skip = True
        
        # INSERT NEW CONTENT
        out.append('        <section class="hero-tradie">\n')
        out.append('            <div class="hero-container">\n')
        out.append('                <div class="hero-text-side">\n')
        out.append('                    <h1 style="text-shadow: 0 4px 20px rgba(0,0,0,0.5);">Win <span class="text-orange">Leads</span>.\n')
        out.append('                        Lock <span class="text-orange">Jobs</span>.\n')
        out.append('                        <br>Get <span class="text-orange">Paid.</span>\n')
        out.append('                    </h1>\n')
        out.append('                    <p class="hero-subtext" style="color: #e2e8f0; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">\n')
        out.append('                        The only network built for the builders of Australia.\n')
        out.append('                    </p>\n')
        out.append('                    <div class="email-capture-form">\n')
        out.append('                        <div class="input-wrapper">\n')
        out.append('                            <span class="input-icon">✉</span>\n')
        out.append('                            <input type="email" placeholder="Enter email address..." style="box-shadow: 0 4px 20px rgba(0,0,0,0.2);">\n')
        out.append('                        </div>\n')
        out.append('                        <button class="btn-solid-white">Join the Network</button>\n')
        out.append('                    </div>\n')
        out.append('                    <div class="trust-section">\n')
        out.append('                        <div class="avatars-group">\n')
        out.append('                            <div class="avatar"><img src="https://i.pravatar.cc/100?img=11" alt="User"></div>\n')
        out.append('                            <div class="avatar"><img src="https://i.pravatar.cc/100?img=12" alt="User"></div>\n')
        out.append('                            <div class="avatar"><img src="https://i.pravatar.cc/100?img=13" alt="User"></div>\n')
        out.append('                            <div class="avatar"><img src="https://i.pravatar.cc/100?img=14" alt="User"></div>\n')
        out.append('                            <div class="avatar"><img src="https://i.pravatar.cc/100?img=15" alt="User"></div>\n')
        out.append('                            <div class="avatar-text">\n')
        out.append('                                <strong>15,000+ Trade Specialists</strong><br>\n')
        out.append('                                Dedicated to Building Better\n')
        out.append('                            </div>\n')
        out.append('                        </div>\n')
        out.append('                    </div>\n')
        out.append('                </div>\n')
        out.append('            </div>\n')
        out.append('            <div class="hero-image-side">\n')
        out.append('                <div class="hero-gradient-mask"></div>\n')
        out.append('                <img src="assets/hero_tradie.png" alt="Happy Tradie">\n')
        out.append('            </div>\n')
        out.append('        </section>\n\n')
        
        out.append('        <section class="ticker-wrapper">\n')
        out.append('            <div class="ticker-inner">\n')
        out.append('                <!-- First Set -->\n')
        out.append('                <div class="ticker-track">\n')
        out.append('                    <span class="ticker-item">Connect With Clients. Build Your Business. Get Discovered. Get More Jobs.</span>\n')
        out.append('                    <span class="ticker-item">Connect With Clients. Build Your Business. Get Discovered. Get More Jobs.</span>\n')
        out.append('                    <span class="ticker-item">Connect With Clients. Build Your Business. Get Discovered. Get More Jobs.</span>\n')
        out.append('                </div>\n')
        out.append('                <!-- Exact Duplicate Set for Seamless Transition -->\n')
        out.append('                <div class="ticker-track">\n')
        out.append('                    <span class="ticker-item">Connect With Clients. Build Your Business. Get Discovered. Get More Jobs.</span>\n')
        out.append('                    <span class="ticker-item">Connect With Clients. Build Your Business. Get Discovered. Get More Jobs.</span>\n')
        out.append('                    <span class="ticker-item">Connect With Clients. Build Your Business. Get Discovered. Get More Jobs.</span>\n')
        out.append('                </div>\n')
        out.append('            </div>\n')
        out.append('        </section>\n')
        
    if '<!-- How It Works Section -->' in line:
        skip = False
        
    if not skip:
        out.append(line)

with open('/Users/dylanj/projects/ventures/Baseify/web/index.html', 'w') as f:
    f.writelines(out)

