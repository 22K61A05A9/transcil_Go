package proxy

import (
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/gin-gonic/gin"
)

// Forward returns a Gin handler that reverse-proxies to the given base URL.
// Method, path, query, headers (including Authorization), and body are preserved.
func Forward(target string) gin.HandlerFunc {
	upstream, err := url.Parse(target)
	if err != nil {
		panic("invalid upstream URL: " + target)
	}

	proxy := httputil.NewSingleHostReverseProxy(upstream)

	// Preserve the original Host header behavior for local services.
	originalDirector := proxy.Director
	proxy.Director = func(req *http.Request) {
		originalDirector(req)
		req.Host = upstream.Host
	}

	return func(c *gin.Context) {
		proxy.ServeHTTP(c.Writer, c.Request)
	}
}
